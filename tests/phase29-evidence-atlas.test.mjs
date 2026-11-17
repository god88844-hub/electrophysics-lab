import {test} from 'node:test';
import assert from 'node:assert/strict';
import '../js/labs/logic/components.js';
import '../js/labs/chip/components.js';
import '../js/labs/quantum/components.js';
import {Diagram} from '../js/core/diagram.js';
import {atlasForLab,buildEvidencePassport,KNOWN_LABS,
  REFERENCE_CATALOG,REFERENCE_SOURCE_COMMIT,PASSPORT_FORMAT}
  from '../js/evidence/phase29-atlas.js';
import {App} from '../js/ui/app.js';

function diagram(lab='logic'){
 const d=new Diagram({id:'source-actual-'+lab,name:'User custom '+lab+' design',lab});
 if(lab==='logic'){
  d.addBlock('logic.IN',{id:'logic-source',x:0,y:0});
  d.addBlock('logic.NOT',{id:'logic-gate',x:160,y:0});
  d.connect('logic-source','out','logic-gate','a');
 }
 return d;
}
const report={
 verdict:'pass',checks:[{name:'function model',verdict:'pass'},
   {name:'extra model note',verdict:'warn'}],title:'Model ONLY',
 assumptions:['ideal source model'],provenance:['synthetic educational reference']
};
test('Every supported lab, including optics and crosslab, has isolated evidence context',()=>{
 assert.deepEqual(KNOWN_LABS,['logic','chip','cpu','rv32i','ai','quantum','optics','crosslab']);
 for(const labId of KNOWN_LABS){
  const catalog=atlasForLab(labId);
  assert.equal(catalog.labId,labId);
  assert.equal(catalog.currentUserPhysicalQualification,'none');
  assert.equal(catalog.realWorldBuildSuccessPercent,null);
  assert.ok(catalog.historicalReferences.every(r=>r.labs.includes(labId)));
  assert.ok(catalog.historicalReferences.every(r=>r.appliesToActiveDiagram===false));
 }
});
test('Historically sourced references have immutable source commit and explicit limited scope',()=>{
 assert.match(REFERENCE_SOURCE_COMMIT,/^[a-f0-9]{40}$/);
 assert.equal(REFERENCE_CATALOG.length,12);
 assert.equal(new Set(REFERENCE_CATALOG.map(x=>x.id)).size,12);
 for(const r of REFERENCE_CATALOG){
  assert.equal(r.origin,'historical-repository-reference');
  assert.equal(r.hardwareValidation,'none');
  assert.equal(r.appliesToActiveDiagram,false);
  assert.ok(r.url.startsWith('https://github.com/god88844-hub/invention-lab/blob/'+REFERENCE_SOURCE_COMMIT+'/'));
  assert.ok(r.summary.length>80,'every reference must explain its bounded scope');
 }
});
test('Canonical logic source diagram and software report are included without physical promotion',()=>{
 const d=diagram(),before=JSON.stringify(d.toJSON());
 const a=buildEvidencePassport({labId:'logic',diagram:d,report,viewMode:'2d'});
 assert.equal(a.format,PASSPORT_FORMAT);
 assert.equal(a.currentDesign.diagramId,d.id);
 assert.equal(a.currentDesign.blockCount,2);
 assert.equal(a.currentDesign.wireCount,1);
 assert.equal(a.currentDesign.simulationCounts.pass,1);
 assert.equal(a.currentDesign.simulationCounts.warn,1);
 assert.equal(a.currentDesign.simulationReportVerdict,'pass');
 assert.equal(a.referenceCasesLinkedToCurrentDesign,0);
 assert.equal(a.originalPhysicalMeasurementsForCurrentDesign,0);
 assert.equal(a.realWorldBuildSuccessPercent,null);
 assert.equal(a.physicalVerdict,'unknown');
 assert.equal(a.releaseDecision,'NOT_QUALIFIED');
 assert.equal(JSON.stringify(d.toJSON()),before);
});
test('3D selection binds component provenance to ORIGINAL diagram, not historical proof',()=>{
 const d=diagram();
 const a=buildEvidencePassport({labId:'logic',diagram:d,viewMode:'3d',selectedBlockId:'logic-gate'});
 assert.equal(a.viewMode,'3d');
 assert.equal(a.currentComponent.id,'logic-gate');
 assert.equal(a.currentComponent.type,'logic.NOT');
 assert.equal(a.currentComponent.physicalVerdict,'unknown');
 assert.equal(a.currentComponent.physicalValidation,'none');
 assert.equal(a.atlas.historicalReferences[0].appliesToActiveDiagram,false);
 assert.equal(a.currentDesign.exactDiagramSnapshot.wires.length,1);
});
test('Evidence passport is a detached exact snapshot, not an editable second netlist',()=>{
 const d=diagram();
 const snapshot=buildEvidencePassport({labId:'logic',diagram:d,report});
 snapshot.currentDesign.exactDiagramSnapshot.blocks[0].params.value=998;
 snapshot.currentDesign.exactDiagramSnapshot.wires.pop();
 snapshot.currentDesign.reportSnapshot.checks[0].verdict='fail';
 snapshot.atlas.historicalReferences[0].hardwareValidation='silicon-tested';
 assert.equal(d.blocks[0].params.value,0);
 assert.equal(d.wires.length,1);
 assert.equal(report.checks[0].verdict,'pass');
 assert.equal(atlasForLab('logic').historicalReferences[0].hardwareValidation,'none');
});
test('Full JSON export roundtrips and preserves no real physical build estimate',()=>{
 const d=diagram('chip');
 const x=buildEvidencePassport({labId:'chip',diagram:d,viewMode:'2d'});
 const copied=JSON.parse(JSON.stringify(x));
 assert.deepEqual(copied,x);
 assert.equal(copied.atlas.historicalReferences.find(r=>r.id==='chip-nogo')?.kind,'release-blocker');
 assert.equal(copied.realWorldBuildSuccessPercent,null);
 assert.equal(copied.independentFoundrySignoffForCurrentDesign,false);
});
test('Software-only reference cannot bleed into a different domain or current diagram',()=>{
 const ai=buildEvidencePassport({labId:'ai',diagram:diagram('ai'),report});
 assert.ok(ai.atlas.historicalReferences.some(r=>r.id==='ai-onnx'));
 assert.ok(ai.atlas.historicalReferences.some(r=>r.id==='ai-iris'));
 assert.equal(ai.atlas.historicalReferences.some(r=>r.id==='rv32-qemu'),false);
 const cpu=buildEvidencePassport({labId:'rv32i',diagram:diagram('rv32i')});
 assert.ok(cpu.atlas.historicalReferences.some(r=>r.id==='rv32-qemu'));
 assert.equal(cpu.atlas.historicalReferences.some(r=>r.id==='ai-iris'),false);
 assert.equal(cpu.currentDesignEvidenceStatus,'computational-model-only');
});
test('Optics has NO fabricated independent physical evidence',()=>{
 const a=buildEvidencePassport({labId:'optics',diagram:diagram('optics')});
 assert.deepEqual(a.atlas.historicalReferences,[]);
 assert.equal(a.currentDesign.simulationReportVerdict,'not-tested');
 assert.equal(a.physicalValidation,'none');
 assert.equal(a.realWorldBuildSuccessPercent,null);
});
test('Crosslab cannot claim one source design or physical certification',()=>{
 const x=buildEvidencePassport({labId:'crosslab',diagram:null});
 assert.equal(x.currentDesign,null);
 assert.equal(x.currentDesignEvidenceStatus,'no-single-current-design');
 assert.equal(x.viewMode,'2d');
 assert.equal(x.realWorldBuildSuccessPercent,null);
 assert.ok(x.atlas.historicalReferences.some(r=>r.id==='cross-adapters'));
 assert.throws(()=>buildEvidencePassport({labId:'crosslab',diagram:diagram('chip')}),/one canonical/);
});
test('Reject lab ID spoofing, mismatched diagram source, invalid view and unlinked components',()=>{
 const d=diagram();
 assert.throws(()=>atlasForLab('admin'),/Unknown invention lab/);
 assert.throws(()=>buildEvidencePassport({labId:'chip',diagram:d}),/exact current lab/);
 assert.throws(()=>buildEvidencePassport({labId:'logic',diagram:d,viewMode:'physical'}),/Invalid source/);
 assert.throws(()=>buildEvidencePassport({labId:'logic',diagram:null}),/exact current lab/);
 const x=buildEvidencePassport({labId:'logic',diagram:d,selectedBlockId:'not-an-existing-block'});
 assert.equal(x.currentComponent,null);
});
test('App shell loads atlas and evidence-export methods in Node tests without DOM',()=>{
 assert.equal(typeof App.prototype.currentEvidencePassport,'function');
 assert.equal(typeof App.prototype._renderEvidenceAtlas,'function');
 assert.equal(typeof App.prototype.exportAs,'function');
});
