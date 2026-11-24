import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CONTROLS, launchMission, loadAcademy, runMission, setMissionControl, type Curriculum, type Mission } from '../../academy/curriculum.js';
import { gradeMission } from '../../academy/missionGrader.js';
import type { AcademyProgress } from '../../academy/progress.js';

const GROUPS = [
  { title: 'Transistors', layers: [1] },
  { title: 'Multi-Radix / ICs', layers: [2] },
  { title: 'Chips / SoC', layers: [3, 4] },
  { title: 'Quantum', layers: [5] },
];
const drawerStyle: React.CSSProperties = {
  position: 'fixed', top: 48, right: 12, width: 'min(400px, 32vw)',
  maxHeight: 'min(62vh, calc(100vh - 68px))', zIndex: 40, overflowY: 'auto',
  boxSizing: 'border-box', border: '1px solid #3e536b', borderRadius: 9, background: '#121c2a',
  boxShadow: '0 8px 24px #0008', color: '#eef3f9', textAlign: 'left',
  font: '13px/1.45 system-ui, sans-serif',
};
const actionStyle: React.CSSProperties = {
  color: '#eef3f9', background: '#23334a', border: '1px solid #4d627f',
  borderRadius: 6, padding: '5px 9px', cursor: 'pointer', font: 'inherit',
};

interface CheckResult { condition: string; status: string; reason?: string }
interface Verdict { id: string; badge: string; status: string; results: CheckResult[]; measurement?: string }

function summarize(telemetry: Awaited<ReturnType<typeof runMission>>) {
  if ('peakK' in telemetry && Number.isFinite(telemetry.peakK)) return 'Peak mixing-stage temperature ' + telemetry.peakK.toFixed(3) + ' K';
  if ('traceTempC' in telemetry && Number.isFinite(telemetry.traceTempC)) return 'Peak trace temperature ' + telemetry.traceTempC.toFixed(1) + ' °C';
  if ('controller' in telemetry && telemetry.controller.length) {
    const end = telemetry.controller.at(-1)!;
    if (Number.isFinite(end.tempC) && Number.isFinite(end.afterMHz)) {
      return 'Final junction ' + end.tempC.toFixed(1) + ' °C · clock ' + end.afterMHz.toFixed(0) + ' MHz';
    }
  }
}

export function AcademyDrawer({ progress, buttonStyle }: { progress: AcademyProgress; buttonStyle: React.CSSProperties }) {
  const [open, setOpen] = useState(false);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [selected, setSelected] = useState<Mission | null>(null);
  const [input, setInput] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [packageFile, setPackageFile] = useState<object | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const completed = useSyncExternalStore(progress.subscribe, progress.get);
  const button = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    button.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
      }
    };
    closeButton.current?.focus();
    window.addEventListener('keydown', dismiss, true);
    void loadAcademy().then((data) => { if (mounted) setCurriculum(data); }, (err: unknown) => {
      if (mounted) setError(err instanceof Error ? err.message : String(err));
    });
    return () => {
      mounted = false;
      window.removeEventListener('keydown', dismiss, true);
    };
  }, [open]);

  function launch(mission: Mission) {
    try {
      launchMission(mission);
      setSelected(mission);
      setInput(String(CONTROLS[mission.id]?.value ?? ''));
      setVerdict(null);
      setPackageFile(null);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function grade() {
    if (!curriculum || !selected || busy) return;
    setBusy(true);
    setError('');
    setVerdict(null);
    setPackageFile(null);
    try {
      const telemetry = await runMission(selected, input.trim() ? Number(input) : Number.NaN);
      const result = gradeMission(curriculum, selected.id, telemetry) as Verdict;
      setVerdict({ ...result, measurement: summarize(telemetry) });
      if (result.status === 'pass') {
        progress.pass(selected.id, curriculum.seal);
        if ('packagedIc' in telemetry && telemetry.packagedIc) setPackageFile(telemetry.packagedIc);
      }
    } catch (err) {
      const result = gradeMission(curriculum, selected.id, {}) as Verdict;
      setVerdict({ ...result, results: result.results.map((check) => ({
        ...check, reason: err instanceof Error ? err.message : String(err),
      })) });
    } finally {
      setBusy(false);
    }
  }

  function downloadIc() {
    if (!packageFile) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(packageFile, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'academy_macro.custom-ic.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  const control = selected && CONTROLS[selected.id];
  const setting = input.trim() ? Number(input) : Number.NaN;
  const invalidInput = !!control && (!Number.isFinite(setting) || setting < control.min || setting > control.max);
  const passed = completed.seal === curriculum?.seal ? completed.passed : [];
  return (
    <>
      <button ref={button} type="button" style={buttonStyle} aria-expanded={open}
        aria-controls="academy-drawer" onClick={() => open ? close() : setOpen(true)}>Academy</button>
      {open && (
        <aside id="academy-drawer" role="region" aria-labelledby="academy-title" style={drawerStyle}
          onKeyDown={(event) => { if (!event.ctrlKey && !event.metaKey) event.stopPropagation(); }}>
          <header style={{ position: 'sticky', top: 0, zIndex: 1, background: '#121c2a', padding: '10px 13px',
            borderBottom: '1px solid #34455b', display: 'flex', alignItems: 'center', gap: 9 }}>
            <h2 id="academy-title" style={{ fontSize: 16, margin: 0, flex: 1 }}>Guided Academy</h2>
            {curriculum && <span style={{ color: '#a9c4b4' }}>{passed.length}/{curriculum.missions.length} complete</span>}
            <button ref={closeButton} type="button" style={actionStyle} aria-label="Close Academy" onClick={close}>×</button>
          </header>
          <div style={{ padding: '0 13px 12px' }}>
            {error && <p role="alert" style={{ color: '#ffbaab' }}>{error}</p>}
            {!curriculum && !error && <p role="status">Verifying curriculum and reference seals…</p>}
            {selected && (
              <section aria-label="Current mission" style={{ padding: '8px 0 12px', borderBottom: '1px solid #34455b' }}>
                <h3 style={{ margin: '2px 0 4px', fontSize: 14 }}>{selected.title}</h3>
                <p style={{ margin: '0 0 8px', color: '#c4d0df' }}>{selected.objective}</p>
                {control && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '8px 0' }}>
                    {control.label}
                    <input type="number" min={control.min} max={control.max} step={control.step} value={input}
                      style={{ ...actionStyle, width: 80, cursor: 'text' }}
                      onChange={(event) => {
                        setInput(event.currentTarget.value);
                        setVerdict(null);
                        setPackageFile(null);
                        const number = event.currentTarget.valueAsNumber;
                        if (number >= control.min && number <= control.max) setMissionControl(selected, number);
                      }} />
                  </label>
                )}
                <button type="button" style={actionStyle} disabled={busy || invalidInput}
                  onClick={() => { void grade(); }}>{busy ? 'Solving…' : 'Grade current workspace'}</button>
                {packageFile && <button type="button" style={{ ...actionStyle, marginLeft: 6 }} onClick={downloadIc}>Download custom IC</button>}
                {verdict && (
                  <div role="status" data-testid="academy-verdict" style={{ marginTop: 8, color: verdict.status === 'pass' ? '#92e6b0' : '#ffb6a4' }}>
                    <strong>{verdict.status === 'pass' ? 'Passed' : verdict.status === 'fail' ? 'Criteria not met' : 'Grading refused'}</strong>
                    <div style={{ font: '11px monospace', color: '#c4d0df' }}>{verdict.badge}</div>
                    {verdict.measurement && <div>{verdict.measurement}</div>}
                    <ul style={{ paddingLeft: 18, margin: '5px 0' }}>
                      {verdict.results.map((result) => (
                        <li key={result.condition}>
                          {result.status === 'pass' ? 'Pass' : result.status === 'fail' ? 'Fail' : 'Refused'} · {result.condition}
                          {result.reason && <div>{result.reason}</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
            {curriculum && GROUPS.map((group) => (
              <section key={group.title} aria-label={group.title}>
                <h3 style={{ margin: '10px 0 5px', fontSize: 12, color: '#b7cadf' }}>{group.title}</h3>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {curriculum.missions.filter((m) => group.layers.includes(m.layer)).map((m) => (
                    <li key={m.id} style={{ marginTop: 3 }}>
                      <button type="button" data-testid={'academy-mission-' + m.id} disabled={busy}
                        aria-current={selected?.id === m.id || undefined}
                        style={{ ...actionStyle, width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}
                        onClick={() => launch(m)}>
                        <span>{m.id.split('-')[0]} · {m.title}</span>
                        {passed.includes(m.id) && <span style={{ color: '#92e6b0' }}>Passed</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </aside>
      )}
    </>
  );
}
