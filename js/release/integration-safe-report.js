// Integration security: generate inert, standalone validation-report HTML.
// Design names, solver outputs and third-party lab reports are untrusted text.
const TEXT_LIMIT=100_000;
const ROW_LIMIT=10_000;
const STATUS=new Set(['pass','warn','fail','unknown']);
const str=(value)=>{
 const result=String(value??'');
 if(result.length>TEXT_LIMIT)throw Error('Report field exceeds text-size limit');
 return result;
};
export function escapeReportText(value){
 return str(value).replace(/[&<>"']/g,ch=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
 })[ch]);
}
function status(value){
 return STATUS.has(value)?value:'unknown';
}
function rows(value){
 if(!Array.isArray(value))return [];
 if(value.length>ROW_LIMIT)throw Error('Report field exceeds row limit');
 return value;
}
export function safeReportFilename(value){
 // Filename is a controlled local download name, not a server filesystem path.
 const safe=str(value||'report').replace(/[^a-z0-9_-]+/gi,'_')
  .replace(/^_+|_+$/g,'').replace(/_+/g,'_').slice(0,80);
 return (safe||'report')+'.report.html';
}
export function renderSafeReportHTML(report){
 if(!report||typeof report!=='object'||Array.isArray(report))
  throw Error('Expected a validation report object');
 const title=escapeReportText(report.title||report.diagramName||'Untitled design');
 const verdict=status(report.verdict);
 const generation=new Date(report.generatedAt);
 const when=Number.isNaN(generation.getTime())?'unknown':generation.toISOString();
 const checks=rows(report.checks).map(c=>{
  const entry=c&&typeof c==='object'?c:{};
  const v=status(entry.verdict);
  return '<tr>'+
   '<td>'+escapeReportText(entry.name)+'</td>'+
   '<td class="'+v+'">'+v.toUpperCase()+'</td>'+
   '<td>'+escapeReportText(entry.actual??'—')+'</td>'+
   '<td>'+escapeReportText(entry.expected??'—')+'</td>'+
   '<td>'+escapeReportText(entry.tolerance??'—')+'</td>'+
   '<td>'+escapeReportText(entry.note??'')+'</td>'+
   '</tr>';
 }).join('');
 const list=value=>rows(value).map(item=>'<li>'+escapeReportText(item)+'</li>').join('')||'<li>none recorded</li>';
 return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>Invention Lab report — ${title}</title>
<style>body{font-family:system-ui;max-width:900px;margin:2rem auto;padding:0 1rem;color:#1c2430}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:4px 8px;font-size:14px}
.pass{color:#167a3d;font-weight:700}.warn{color:#9a6a10;font-weight:700}.fail{color:#a8281f;font-weight:700}.unknown{color:#55606e;font-weight:700}</style></head><body>
<h1>Invention Lab — validation report</h1>
<p><b>${title}</b> — verdict: <b class="${verdict}">${verdict.toUpperCase()}</b> (${when})</p>
<p><i>“All models are wrong; the practical question is how wrong do they have to be to not be useful.” — G. E. P. Box</i></p>
<h2>Checks</h2><table><tr><th>Check</th><th>Verdict</th><th>Actual</th><th>Expected</th><th>Tolerance</th><th>Note</th></tr>
${checks}</table>
<h2>Assumptions &amp; unknowns</h2><ul>${list(report.assumptions)}</ul>
<h2>Model provenance</h2><ul>${list(report.provenance)}</ul>
</body></html>`;
}
