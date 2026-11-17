import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {escapeReportText,safeReportFilename,renderSafeReportHTML} from '../js/release/integration-safe-report.js';
const evil='<img src=x onerror=alert(17)><script>alert(99)</script>';
test('Downloaded report encodes every user-controlled solver text field',()=>{
 const report={
  title:evil,generatedAt:'2026-11-17',verdict:'" autofocus onfocus="alert(19)',
  checks:[{name:evil,verdict:'"><svg/onload=alert(22)>',actual:evil,
   expected:'"><iframe srcdoc=x>',tolerance:evil,note:evil}],
  assumptions:[evil],provenance:[evil]
 };
 const html=renderSafeReportHTML(report);
 assert.ok(html.includes('&lt;img src=x onerror=alert(17)&gt;'));
 assert.ok(!html.includes('<img'));
 assert.ok(!html.includes('<script'));
 assert.ok(!html.includes('<iframe'));
 assert.ok(!html.includes('<svg'));
 assert.ok(html.includes('class="unknown"'));
 assert.ok(!html.includes('autofocus'));
 assert.ok(!html.includes('<script>alert(99)</script>'));
 assert.match(html,/default-src 'none'/);
 assert.match(html,/form-action 'none'/);
});
test('Filename is basename-only and cannot contain folder traversal or HTML',()=>{
 assert.equal(safeReportFilename('../../evil/<script>alert(1)</script>'),'evil_script_alert_1_script.report.html');
 assert.equal(safeReportFilename('...'), 'report.report.html');
 assert.ok(safeReportFilename('A'.repeat(300)).length<=92);
 assert.match(escapeReportText('<"\'&>'),/&lt;&quot;&#39;&amp;&gt;/);
});
test('Invalid/oversized reports are rejected rather than emitted as active HTML',()=>{
 assert.throws(()=>renderSafeReportHTML(null));
 assert.throws(()=>renderSafeReportHTML({checks:Array(10001).fill({})}),/row limit/);
 assert.throws(()=>renderSafeReportHTML({checks:[{actual:'x'.repeat(100001)}]}),/text-size/);
});
test('Browser shell uses centralized report escaping and escapes plugin-provided help and console classes',async()=>{
 const app=await readFile(new URL('../js/ui/app.js',import.meta.url),'utf8');
 assert.match(app,/renderSafeReportHTML\(report\)/);
 assert.match(app,/safeReportFilename\(report.title/);
 assert.match(app,/escape\(lab.label\)/);
 assert.match(app,/escape\(lab\?\.blurb/);
 assert.ok(app.includes('${escape(l.t)}'));
 assert.match(app,/safeConsoleClass\(l.cls\)/);
});
