import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {SAMPLE,validateManifest,serializeManifest,createRegistry,admitManifest,runAdmitted,auditPlugin} from '../js/evidence/phase66-plugin-admission.js';
const sha=s=>createHash('sha256').update(s).digest('hex');
test('Pinned data-only plugin runs builtin Ohms law with correct SI units',()=>{
 const raw=serializeManifest(SAMPLE),registry=createRegistry();
 const a=admitManifest(registry,raw,{expectedSHA256:sha(raw)});
 const r=runAdmitted(registry,SAMPLE.pluginId,{voltageV:3,resistanceOhm:6});
 assert.equal(a.publisherIndependentlyAuthenticated,false);
 assert.equal(r.calculation.currentA,0.5);assert.equal(r.calculation.powerW,1.5);
 assert.equal(r.externalCodeExecuted,false);
});
test('Manipulated payload, untrusted SHA pin and plugin identity shadows refused',()=>{
 const registry=createRegistry(),raw=serializeManifest(SAMPLE);
 assert.throws(()=>admitManifest(registry,raw,{expectedSHA256:'0'.repeat(64)}));
 admitManifest(registry,raw,{expectedSHA256:sha(raw)});
 assert.throws(()=>admitManifest(registry,raw,{expectedSHA256:sha(raw)}));
 assert.equal(registry.size,1);
});
test('Javascript code, remote imports, dangerous properties and forged capabilities refused',()=>{
 const invalid=[
  {...SAMPLE,code:'process.exit(1)'},
  {...SAMPLE,permissions:['network']},
  {...SAMPLE,engine:'vm.execute'},
  {...SAMPLE,parameters:[{id:'voltageV',unit:'ohm',minimum:-1000,maximum:1000},SAMPLE.parameters[1]]},
  {...SAMPLE,parameters:[...SAMPLE.parameters,{id:'exec',unit:'str',minimum:0,maximum:1}]},
  JSON.parse('{"__proto__":{"admin":true}}')
 ];
 for(const m of invalid)assert.throws(()=>validateManifest(m));
});
test('Unbounded power, non-numeric inputs and added properties fail closed',()=>{
 const registry=createRegistry(),raw=serializeManifest(SAMPLE);
 admitManifest(registry,raw,{expectedSHA256:sha(raw)});
 for(const x of [{voltageV:3,resistanceOhm:0},{voltageV:Infinity,resistanceOhm:6},
  {voltageV:3,resistanceOhm:6,physicalValidated:true},
  {voltageV:'3',resistanceOhm:6},{voltageV:1001,resistanceOhm:1}])
  assert.throws(()=>runAdmitted(registry,SAMPLE.pluginId,x));
});
test('Pinning is byte integrity, not author authentication, runtime isolation or physical success',()=>{
 const a=auditPlugin();assert.deepEqual(a,auditPlugin());
 assert.equal(a.trueRuntimeSandboxAvailable,false);
 assert.equal(a.result.independentPublisherIdentityAuthenticated,false);
 assert.equal(a.realWorldBuildSuccessPercent,null);
});
