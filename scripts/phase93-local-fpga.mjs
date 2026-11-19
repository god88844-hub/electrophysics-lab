#!/usr/bin/env node
// Explicit local, opt-in iCE40 FPGA build/flash helper.
// Needs installed yosys, nextpnr-ice40, icepack and openFPGALoader.
// No hidden USB access, no automatic pin assignment, no signoff claims.
import {mkdtemp,readFile,writeFile,rm,mkdir,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,basename} from 'node:path';
import {spawn} from 'node:child_process';
import {fpgaLogicSpec,emitFPGAVerilog,planOpenFPGAFlow}
 from '../js/hardware/phase93-fpga.js';
function args(argv){
 const allowed=new Set(['--board','--pcf','--device','--package','--output','--flash','--understand-physical-risk']);
 const opts={board:null,pcf:null,device:'hx8k',package:'ct256',output:null,
  flash:false,understand:false};
 for(let i=0;i<argv.length;i++){
  const key=argv[i];if(!allowed.has(key))throw Error('Unrecognized CLI option '+key);
  if(key==='--flash'){opts.flash=true;continue;}
  if(key==='--understand-physical-risk'){opts.understand=true;continue;}
  const v=argv[++i];if(!v||v.startsWith('--'))throw Error('Option requires a value '+key);
  if(key==='--board')opts.board=v;
  if(key==='--pcf')opts.pcf=v;
  if(key==='--device')opts.device=v;
  if(key==='--package')opts.package=v;
  if(key==='--output')opts.output=v;
 }
 if(!opts.board||!opts.pcf||!opts.output)throw Error('Specify --board --pcf --output explicitly');
 if(opts.flash!==opts.understand)throw Error('Flashing requires both --flash and --understand-physical-risk');
 if(!/^[A-Za-z0-9_.-]{1,100}\.bin$/.test(basename(opts.output)))
  throw Error('Output must be a local .bin filename');
 return opts;
}
function launch(bin,argv,cwd){
 return new Promise((ok,no)=>{
  const child=spawn(bin,argv,{cwd,stdio:'inherit',shell:false,
   windowsHide:true,env:process.env});
  const timeout=setTimeout(()=>child.kill('SIGTERM'),120000);
  child.once('error',e=>{clearTimeout(timeout);no(e);});
  child.once('exit',(code,signal)=>{
   clearTimeout(timeout);
   code===0?ok():no(Error(bin+' failed: '+(signal||code)));
  });
 });
}
const opts=args(process.argv.slice(2));
const spec=fpgaLogicSpec({name:'q4_half_adder',radix:4});
const rtl=emitFPGAVerilog(spec);
const plan=planOpenFPGAFlow({spec,board:opts.board,device:opts.device,
 packageName:opts.package,pinConstraintsFile:'user.pcf',
 bitstreamFile:'q4_half_adder.bin',approved:opts.flash});
const originalPCF=await readFile(resolve(opts.pcf));
if(originalPCF.length<10||originalPCF.length>100000)
 throw Error('Explicit PCF constraint file size invalid');
const work=await mkdtemp(join(tmpdir(),'invention-lab-phase93-'));
try{
 await writeFile(join(work,rtl.filename),rtl.content);
 await writeFile(join(work,'user.pcf'),originalPCF);
 // Toolchain is an explicit local user action, not executed from model text.
 for(const step of plan.commands.slice(0,3))await launch(step.bin,step.args,work);
 await mkdir(resolve(opts.output,'..'),{recursive:true});
 await copyFile(join(work,'q4_half_adder.bin'),resolve(opts.output));
 if(opts.flash)await launch('openFPGALoader',
  ['-b',opts.board,resolve(opts.output)],work);
 process.stdout.write(JSON.stringify({format:plan.format,source:rtl.filename,
  board:opts.board,bitstreamPath:resolve(opts.output),
  toolchainExecuted:true,boardProgrammedByUserRequest:opts.flash,
  uartCapturePerformed:false,deviceAuthenticated:false,
  physicalQualification:'NO_GO'},null,2)+'\n');
}finally{await rm(work,{recursive:true,force:true});}
