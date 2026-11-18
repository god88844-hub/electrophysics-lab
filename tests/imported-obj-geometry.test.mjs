import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseMillimetreOBJ,objTrianglesForPart,IMPORTED_OBJ_FORMAT}
 from '../js/scene/imported-obj-geometry.js';
import {detailedCADMesh} from '../js/scene/detailed-cad-mesh.js';
const cube=`# mm Y-up cuboid
v -5 0 -4
v 5 0 -4
v 5 0 4
v -5 0 4
v -5 6 -4
v 5 6 -4
v 5 6 4
v -5 6 4
f 1 2 3 4
f 5 8 7 6
f 1 5 6 2
f 2 6 7 3
f 3 7 8 4
f 4 8 5 1`;
const part={xMm:42,yMm:11,zMm:-17,widthMm:10,heightMm:6,depthMm:8};
test('user-imported 3D geometry is dimensioned at exactly 20 mm/world',()=>{
 const obj=parseMillimetreOBJ(cube);
 assert.equal(obj.format,IMPORTED_OBJ_FORMAT);assert.equal(obj.faces.length,12);
 assert.deepEqual([obj.boundsMm.widthMm,obj.boundsMm.heightMm,obj.boundsMm.depthMm],[10,6,8]);
 const verts=objTrianglesForPart(obj,part);
 assert.equal(verts.length,12*3*6);
 const xs=verts.filter((_,i)=>i%6===0);
 const ys=verts.filter((_,i)=>i%6===1);
 assert.equal(Math.min(...xs),(42-5)/20);assert.equal(Math.max(...ys),(11+6)/20);
 assert.equal(obj.manufacturerCAD,false);assert.equal(obj.physicalValidation,'none');
});
test('mismatched dimensions are rejected instead of silently scaling',()=>{
 const obj=parseMillimetreOBJ(cube);
 assert.throws(()=>objTrianglesForPart(obj,{...part,widthMm:20}),/disagrees/);
 assert.throws(()=>objTrianglesForPart(obj,part,1),/20 mm/);
});
test('malformed, unsupported, degenerate or oversized geometry fails closed',()=>{
 for(const value of [cube.replace('f 1 2 3 4','f -1 2 3'),cube.replace('f 1 2 3 4','f 1 1 2'),
  cube.replace('f 1 2 3 4','f 1 2 999'),cube.replace('v 5 0 -4','v NaN 0 -4'),
  cube+'\ncurv 1 2 3',cube+'\n\u2603', 'v 0 0 0\nf 1 1 1',' '.repeat(4_000_001)])
  assert.throws(()=>parseMillimetreOBJ(value));
});
test('material URLs in OBJ are inert and do not initiate network requests',()=>{
 const obj=parseMillimetreOBJ('mtllib https://invalid.test/material.mtl\n'+cube+'\nusemtl fixture');
 assert.equal(obj.faces.length,12);assert.equal(obj.sourceAuthenticity,'unverified');
});

test('imported triangles replace procedural body in actual CAD 3D mesh pipeline',()=>{
 const report={parts:[{id:'part1',type:'chip.RES',...part,
  bounds:{x0:37,x1:47,y0:11,y1:17,z0:-21,z1:-13}}],geometrySource:'explicit-mm-envelope'};
 const proxy=detailedCADMesh(report);
 const imported=detailedCADMesh(report,{importedMeshes:new Map([['part1',parseMillimetreOBJ(cube)]])});
 assert.equal(proxy.importedMeshCount,0);
 assert.equal(imported.importedMeshCount,1);
 assert.equal(imported.manufacturerCAD,false);
 assert.equal(imported.physicalValidation,'none');
 assert.notDeepEqual(imported.triangles,proxy.triangles);
 assert.ok(imported.triangles.every(Number.isFinite));
});
