// Phase 83: real WebGL2/ANGLE-instanced proxy cube renderer for large canonical
// scenes. Not WebGPU and not a physical geometry/60-FPS certification.
export const INSTANCED_GL_FORMAT='invention-lab/phase83-webgl-instanced-proxy/1';
function makeShader(gl,type,source){
 const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
  const message=gl.getShaderInfoLog(shader);
  gl.deleteShader(shader);throw Error('Instanced GPU shader: '+message);
 }
 return shader;
}
export function createInstancedProxyRenderer(gl){
 if(!gl)throw Error('WebGL context required');
 const native=typeof gl.drawArraysInstanced==='function';
 const ext=native?null:gl.getExtension('ANGLE_instanced_arrays');
 if(!native&&!ext)return {format:INSTANCED_GL_FORMAT,supported:false,
  backend:'none',draw:()=>({drawn:0,reason:'GPU-instancing-unavailable'}),dispose:()=>{}};
 const vertex=String.raw`attribute vec3 aCube;
attribute vec3 aOffset;
attribute vec3 aSize;
attribute vec3 aRgb;
uniform mat4 uMatrix;
varying vec3 vRgb;
void main(){
 vRgb=aRgb;
 gl_Position=uMatrix*vec4(aOffset+aCube*aSize,1.0);
}`;
 const fragment=String.raw`precision mediump float;
varying vec3 vRgb;
void main(){gl_FragColor=vec4(vRgb,1.0);}`;
 const program=gl.createProgram(),vs=makeShader(gl,gl.VERTEX_SHADER,vertex),
  fs=makeShader(gl,gl.FRAGMENT_SHADER,fragment);
 gl.attachShader(program,vs);gl.attachShader(program,fs);
 gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))
  throw Error('Instanced GPU program: '+gl.getProgramInfoLog(program));
 gl.deleteShader(vs);gl.deleteShader(fs);
 const staticBuffer=gl.createBuffer(),instanceBuffer=gl.createBuffer();
 // 12 triangles / six faces. Unit x/z centered, base y=0.
 const corners=[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],
  [-.5,1,-.5],[.5,1,-.5],[.5,1,.5],[-.5,1,.5]];
 const quad=[[4,5,6,7],[0,3,2,1],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
 const cube=[];
 for(const [a,b,c,d] of quad)for(const index of [a,b,c,a,c,d])cube.push(...corners[index]);
 gl.bindBuffer(gl.ARRAY_BUFFER,staticBuffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(cube),gl.STATIC_DRAW);
 const attributes=['aCube','aOffset','aSize','aRgb'].map(k=>gl.getAttribLocation(program,k));
 if(attributes.some(x=>x<0))throw Error('Instanced shader attribute missing');
 const matrix=gl.getUniformLocation(program,'uMatrix');
 const divisor=(loc,n)=>native?gl.vertexAttribDivisor(loc,n):ext.vertexAttribDivisorANGLE(loc,n);
 const drawInstanced=(count)=>native?gl.drawArraysInstanced(gl.TRIANGLES,0,36,count):
  ext.drawArraysInstancedANGLE(gl.TRIANGLES,0,36,count);
 function draw(instances,cameraMatrix){
  if(!Array.isArray(instances)||instances.length>100000||!cameraMatrix||
    cameraMatrix.length!==16||![...cameraMatrix].every(Number.isFinite))
   throw Error('Invalid or oversized WebGL instancing batch');
  const data=new Float32Array(instances.length*9);
  for(let i=0;i<instances.length;i++){
   const b=instances[i];
   const fields=[b.x,b.y??0,b.z,b.w,b.h,b.d,...(b.color||[])];
   if(fields.length!==9||fields.some(x=>typeof x!=='number'||!Number.isFinite(x))||
    fields[3]<=0||fields[4]<=0||fields[5]<=0)
    throw Error('Invalid instanced block dimensions or colors');
   data.set(fields,i*9);
  }
  gl.useProgram(program);gl.uniformMatrix4fv(matrix,false,cameraMatrix);
  gl.bindBuffer(gl.ARRAY_BUFFER,staticBuffer);
  gl.enableVertexAttribArray(attributes[0]);
  gl.vertexAttribPointer(attributes[0],3,gl.FLOAT,false,12,0);
  divisor(attributes[0],0);
  gl.bindBuffer(gl.ARRAY_BUFFER,instanceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);
  for(let j=1;j<4;j++){
   gl.enableVertexAttribArray(attributes[j]);
   gl.vertexAttribPointer(attributes[j],3,gl.FLOAT,false,36,(j-1)*12);
   divisor(attributes[j],1);
  }
  drawInstanced(instances.length);
  for(let j=1;j<4;j++){divisor(attributes[j],0);gl.disableVertexAttribArray(attributes[j]);}
  gl.disableVertexAttribArray(attributes[0]);
  return {format:INSTANCED_GL_FORMAT,drawn:instances.length,
   backend:native?'WebGL2':'ANGLE_instanced_arrays',physicalValidation:'none',
   frameRateGuaranteed:false};
 }
 function dispose(){gl.deleteBuffer(staticBuffer);gl.deleteBuffer(instanceBuffer);gl.deleteProgram(program);}
 return {format:INSTANCED_GL_FORMAT,supported:true,
  backend:native?'WebGL2':'ANGLE_instanced_arrays',draw,dispose};
}
