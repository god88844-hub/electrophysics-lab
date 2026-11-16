// RV32I Lab — dedicated architectural interpreter, independent of IL-8 Lab.
// A user-provided expected register value is a software acceptance criterion,
// NOT a certified reference trace or evidence of real silicon.
import { registerLab } from '../../core/registry.js';
import { assembleReport } from '../../core/validation.js';
import { parseRV32Words, runRV32I } from './rv32i.js';

export const rv32iLab = {
  id:'rv32i',
  label:'RISC-V RV32I',
  blurb:'Learn and experiment with unprivileged RV32I 2.1 instruction execution, memory, registers, branches and architectural traps.',
  accent:'#68badb',
  metaSchema:[
    {key:'source',label:'RV32I machine words (one 8-digit hex instruction per line)',type:'textarea',
      default:'00500093\n00700113\n002081b3\n00100073'},
    {key:'expectedRegister',label:'Expected register (x0 to x31)',type:'number',default:3,noTolRequired:true},
    {key:'expectedValue',label:'Expected unsigned 32-bit value',type:'number',default:12,noTolRequired:true},
    {key:'maxSteps',label:'Maximum instructions',type:'number',default:20000,noTolRequired:true},
  ],
  run(diagram) {
    const meta=diagram?.meta||{};
    try {
      const words=parseRV32Words(meta.source||'');
      const cpu=runRV32I(words,{maxSteps:meta.maxSteps??20000,maxTrace:128});
      return {
        ok:cpu.ok, words:[...words],cpu,
        problems:cpu.ok?[]:[cpu.trap?.detail||'Execution stopped without reaching a breakpoint'],
        warnings:['Architectural functional model only; no pipeline timing, operating system, external device or physical silicon model.'],
      };
    }catch(error) {
      return {ok:false,words:[],cpu:null,problems:[error.message],warnings:[]};
    }
  },
  validate(diagram){
    const result=this.run(diagram),meta=diagram.meta||{}, checks=[];
    checks.push({
      name:'RV32I hexadecimal machine-code parse and bounded execution',
      verdict:result.cpu?'pass':'fail',stage:'execution',
      actual:result.cpu?.retired??null,expected:null,tolerance:null,
      note:result.problems.join('; ')||String(result.words.length)+' instruction words decoded',
    });
    if (!result.cpu) return checks;
    checks.push({
      name:'Program reaches an explicit EBREAK trap before exhausting budget',
      verdict:result.cpu.stopReason==='ebreak'?'pass':'fail',stage:'execution',
      actual:result.cpu.stopReason,expected:'ebreak',tolerance:0,
      note:'EBREAK is an architectural trap, used by this educational harness as a stopping point; it is not proof of operating-system or device behavior.',
    });
    const r=Number(meta.expectedRegister??3),v=Number(meta.expectedValue??12);
    const valid=Number.isInteger(r)&&r>=0&&r<32&&Number.isInteger(v)&&v>=0&&v<=0xffffffff;
    checks.push({
      name:'User-specified functional register expectation (not an independent oracle)',
      verdict:valid&&result.cpu.regs[r]===v?'pass':'fail',
      stage:'mathematical',actual:valid?result.cpu.regs[r]:null,expected:valid?v:null,
      tolerance:0,
      note:valid?'Compare unsigned register x'+r+' to the declared expected value.':'Expected register index/value must be valid 32-bit integers.',
    });
    return checks;
  },
  report(diagram){
    return assembleReport({diagram,checks:this.validate(diagram)});
  },
};
registerLab(rv32iLab);
