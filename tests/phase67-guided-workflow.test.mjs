import {test} from 'node:test';import assert from 'node:assert/strict';
import {GUIDES,guideState,nextGuide} from '../js/ui/phase67-guided-workflow.js';
test('seven beginner and advanced lab guides',()=>{assert.equal(Object.keys(GUIDES).length,7);for(const lab of Object.keys(GUIDES)){assert.equal(guideState(lab).total,3);assert.equal(guideState(lab,'advanced').total,4)}});
test('step bounds and mode validation',()=>{let s=guideState('chip');s=nextGuide(s,-1);assert.equal(s.step,0);for(let i=0;i<12;i++)s=nextGuide(s);assert.equal(s.step,2);assert.throws(()=>guideState('unknown'));assert.throws(()=>guideState('chip','invalid'));assert.throws(()=>guideState('chip','beginner',50))});
test('no unsupported physical proof',()=>assert.equal(guideState('quantum').physicalValidation,'unknown'));
