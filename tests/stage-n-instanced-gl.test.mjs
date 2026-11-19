import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createInstancedProxyRenderer} from '../js/scene/stage-n-instanced-gl.js';
test('Missing instancing extension leaves the old renderer available',()=>{
 const old=createInstancedProxyRenderer({getExtension:()=>null});
 assert.equal(old.supported,false);
 assert.equal(old.draw().drawn,0);
});
test('WebGL2 instanced proxy draws real indexed batch with per-instance size/color',()=>{
 const calls=[],attributes={aCube:0,aOffset:1,aSize:2,aRgb:3};
 const gl={
  VERTEX_SHADER:1,FRAGMENT_SHADER:2,COMPILE_STATUS:3,LINK_STATUS:4,
  ARRAY_BUFFER:5,STATIC_DRAW:6,DYNAMIC_DRAW:7,FLOAT:8,TRIANGLES:9,
  createShader:()=>({}),shaderSource:()=>{},compileShader:()=>{},
  getShaderParameter:()=>true,deleteShader:()=>{},
  createProgram:()=>({}),attachShader:()=>{},linkProgram:()=>{},
  getProgramParameter:()=>true,deleteProgram:()=>{},
  createBuffer:()=>({}),getAttribLocation:(_,name)=>attributes[name],
  getUniformLocation:()=>({}),bindBuffer:()=>{},bufferData:(_,data)=>calls.push(['buffer',data.length]),
  useProgram:()=>{},uniformMatrix4fv:()=>{},enableVertexAttribArray:()=>{},
  vertexAttribPointer:()=>{},vertexAttribDivisor:()=>{},
  disableVertexAttribArray:()=>{},deleteBuffer:()=>{},
  drawArraysInstanced:(_,__,___,count)=>calls.push(['draw',count])
 };
 const render=createInstancedProxyRenderer(gl);
 assert.equal(render.supported,true);
 const blocks=Array.from({length:2000},(_,i)=>({
  x:i,y:0,z:0,w:1,h:1,d:1,color:[.3,.4,.5]
 }));
 const out=render.draw(blocks,Array(16).fill(0));
 assert.equal(out.drawn,2000);
 assert.equal(out.frameRateGuaranteed,false);
 assert.ok(calls.some(([kind,n])=>kind==='draw'&&n===2000));
 assert.throws(()=>render.draw([{x:0,y:0,z:0,w:-1,h:1,d:1,color:[1,1,1]}],Array(16).fill(0)));
 render.dispose();
});
