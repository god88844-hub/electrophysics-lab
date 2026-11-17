import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createStore,commit,checkout,fork,fastForward,verifyStore,exportBundle,importBundle,SAMPLE} from '../js/evidence/phase65-project-history.js';
const clone=x=>structuredClone(x);
test('Content-addressed engineering objects, commits and branch snapshots round-trip',()=>{
 const s=createStore(),a=commit(s,SAMPLE);const b=commit(s,{...SAMPLE,notes:'v2'},{expectedHead:a});
 assert.notEqual(a,b);assert.equal(checkout(s,'main').notes,'v2');
 assert.equal(verifyStore(s).commitCount,2);
 assert.equal(exportBundle(importBundle(exportBundle(s))),exportBundle(s));
});
test('A checkout is detached from store contents and hash integrity remains',()=>{
 const s=createStore();commit(s,SAMPLE);
 const x=checkout(s,'main');x.notes='forged';
 assert.equal(checkout(s,'main').notes,SAMPLE.notes);
 assert.equal(verifyStore(s).valid,true);
});
test('Fast-forward works for linear history; stale head and divergent branch rejected',()=>{
 const s=createStore(),base=commit(s,SAMPLE);fork(s,'main','experiment');
 const tip=commit(s,{...SAMPLE,notes:'experiment'},{branch:'experiment',expectedHead:base});
 assert.equal(fastForward(s,{source:'experiment',target:'main',expectedTargetHead:base}),tip);
 assert.throws(()=>commit(s,SAMPLE,{expectedHead:base}));
 fork(s,'main','left');fork(s,'main','right');
 const a=commit(s,{...SAMPLE,notes:'left'},{branch:'left',expectedHead:tip});
 commit(s,{...SAMPLE,notes:'right'},{branch:'right',expectedHead:tip});
 assert.throws(()=>fastForward(s,{source:'right',target:'left',expectedTargetHead:a}));
});
test('Any tampered evidence object, commit, or branch head fails verification',()=>{
 const s=createStore(),h=commit(s,SAMPLE);
 const a=clone(s);a.objects[a.commits[h].objectSha].notes='tampered';assert.throws(()=>verifyStore(a));
 const b=clone(s);b.commits[h].message='tampered';assert.throws(()=>verifyStore(b));
 const c=clone(s);c.refs.main='f'.repeat(64);assert.throws(()=>verifyStore(c));
});
test('No physical qualification can be inserted or claimed by project history',()=>{
 const s=createStore();
 for(const bad of [
  {...SAMPLE,evidence:[{evidenceId:'fake',sourceSHA256:'f'.repeat(64),physicalValidation:'pass'}]},
  {...SAMPLE,evidence:[{evidenceId:'fake',sourceSHA256:'not-a-hash',physicalValidation:'none'}]},
  {...SAMPLE,notes:Infinity}
 ])assert.throws(()=>commit(s,bad));
 assert.equal(verifyStore(s).originAttestation,'NOT_ESTABLISHED');
});
test('Malicious data keys and invalid dangling design endpoints are rejected',()=>{
 const s=createStore(),proto=JSON.parse('{"__proto__":{"role":"admin"}}');
 assert.throws(()=>commit(s,{...SAMPLE,designs:[],extra:proto}));
 const d={format:'invention-lab/1',id:'d',lab:'logic',name:'test',meta:{},blocks:[],wires:[{id:'w',from:{block:'missing',port:'out'},to:{block:'absent',port:'in'}}]};
 assert.throws(()=>commit(s,{...SAMPLE,designs:[d]}));
});
