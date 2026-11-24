import { loadAcademy } from './curriculum.js';

const FORMAT = 'invention-lab/academy-progress/1';
type Progress = Readonly<{ seal: string; passed: readonly string[] }>;
type ProjectSnapshot = { experiments: unknown[] };

export function createAcademyProgress() {
  let snapshot: Progress = { seal: '', passed: [] };
  const listeners = new Set<() => void>();
  const replace = (progress: Progress) => {
    snapshot = progress;
    for (const listener of listeners) listener();
  };
  let revision = 0;
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    get() { return snapshot; },
    pass(id: string, seal: string) {
      revision += 1;
      const previous = snapshot.seal === seal ? snapshot.passed : [];
      replace({ seal, passed: [...new Set([...previous, id])].sort() });
    },
    withProject<T extends ProjectSnapshot>(project: T): T {
      if (snapshot.passed.length === 0) return project;
      const record = { format: FORMAT, curriculumSeal: snapshot.seal,
        missions: Object.fromEntries(snapshot.passed.map((id) => [id, 'pass'])) };
      return { ...project, experiments: [...project.experiments, record] };
    },
    async restore(project: { experiments?: unknown[] }) {
      const thisRevision = ++revision;
      replace({ seal: '', passed: [] });
      const records = project.experiments?.filter((e): e is Record<string, unknown> =>
        !!e && typeof e === 'object' && 'format' in e && e.format === FORMAT) ?? [];
      if (records.length !== 1) return;
      const { curriculumSeal, missions } = records[0];
      const curriculum = await loadAcademy();
      if (thisRevision !== revision || curriculumSeal !== curriculum.seal
        || !missions || typeof missions !== 'object' || Array.isArray(missions)) return;
      const status = Object.entries(missions);
      const all = new Set(curriculum.missions.map((m) => m.id));
      if (status.every(([id, verdict]) => all.has(id) && verdict === 'pass')) {
        replace({ seal: curriculum.seal, passed: status.map(([id]) => id).sort() });
      }
    },
  };
}

export type AcademyProgress = ReturnType<typeof createAcademyProgress>;
