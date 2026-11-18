// Stage M / Phase 73 safe operating area (SOA) preflight.
// Bounds below come from published PDK *model operating ranges*, not proven
// oxide breakdown voltage or authenticated foundry qualification. A pass here
// cannot substitute for calibrated SPICE, DRC/LVS, HCI or device aging tests.
import {makeVoltageRails,PDK_SOURCES} from './phase73-mvl-devices.js';
export const SOA_FORMAT='invention-lab/phase73-transistor-soa/1';
const SKY='https://skywater-pdk.readthedocs.io/en/main/rules/device-details.html';
const GF='https://gf180mcu-pdk.readthedocs.io/en/latest/physical_verification/design_manual/drm_14_1.html';
const LIMITS=[
 ['sky130_fd_pr__nfet_01v8','SKY130','n',1.95,1.95,-1.95,.3,SKY],
 ['sky130_fd_pr__pfet_01v8','SKY130','p',1.95,1.95,-.1,1.95,SKY],
 ['sky130_fd_pr__nfet_01v8_lvt','SKY130','n',1.95,1.95,-1.95,.3,SKY],
 ['sky130_fd_pr__pfet_01v8_hvt','SKY130','p',1.95,1.95,-.1,1.95,SKY],
 ['sky130_fd_pr__nfet_g5v0d10v5','SKY130','n',5.5,11,-5.5,0,SKY],
 ['sky130_fd_pr__pfet_g5v0d10v5','SKY130','p',5.5,11,0,5.5,SKY],
 // GF180 MCU published thin gate-to-any-terminal absolute ceiling is 3.63V.
 // Constrain all terminal differences conservatively to <=3.63V, pending
 // independent drain/body SOA and HCI rule-deck verification.
 ['gf180mcu_fd_pr__nfet_03v3','GF180MCU','n',3.63,3.63,-3.63,0,GF],
 ['gf180mcu_fd_pr__pfet_03v3','GF180MCU','p',3.63,3.63,0,3.63,GF]
];
export const MOS_SOA_LIMITS=Object.freeze(Object.fromEntries(LIMITS.map(
 ([name,pdk,polarity,maxGateV,maxDrainV,minVbs,maxVbs,sourceUrl])=>[
 name,Object.freeze({name,pdk,polarity,maxGateV,maxDrainV,minVbs,maxVbs,sourceUrl,
 modelLimitOnly:true,independentAbsoluteMaxVerified:false,
 temperatureEnvelopeIndependentlyVerified:false})
])));
const PROFILE_MAP=Object.freeze({
 'sky130-core-1v8':Object.freeze({pdk:'SKY130',nominalV:1.8,maximumSpecifiedRippleFraction:.05,regulator:'LDO_REGULATED',
  n:'sky130_fd_pr__nfet_01v8',p:'sky130_fd_pr__pfet_01v8',
  extra:['sky130_fd_pr__nfet_01v8_lvt','sky130_fd_pr__pfet_01v8_hvt']}),
 'sky130-core-1v65-unregulated':Object.freeze({pdk:'SKY130',nominalV:1.65,maximumSpecifiedRippleFraction:.1,regulator:'UNREGULATED',
  n:'sky130_fd_pr__nfet_01v8',p:'sky130_fd_pr__pfet_01v8',
  extra:['sky130_fd_pr__nfet_01v8_lvt','sky130_fd_pr__pfet_01v8_hvt']}),
 'gf180-core-3v3':Object.freeze({pdk:'GF180MCU',nominalV:3.3,maximumSpecifiedRippleFraction:.1,regulator:'SPECIFIED_UNVERIFIED',
  n:'gf180mcu_fd_pr__nfet_03v3',p:'gf180mcu_fd_pr__pfet_03v3',extra:[]}),
 'sky130-thick-3v3':Object.freeze({pdk:'SKY130',nominalV:3.3,maximumSpecifiedRippleFraction:.1,regulator:'SPECIFIED_UNVERIFIED',
  n:'sky130_fd_pr__nfet_g5v0d10v5',
  p:'sky130_fd_pr__pfet_g5v0d10v5',extra:[]})
});
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const within=(x,low,high)=>x>=low-1e-10&&x<=high+1e-10;
export function makeFoundryRailProfile({
 id='sky130-core-1v8',radix=4,rippleFraction=undefined,temperatureC=25
}={}){
 const source=PROFILE_MAP[id];
 const selectedRippleFraction=rippleFraction===undefined?
  source?.maximumSpecifiedRippleFraction:rippleFraction;
 if(!source||![2,3,4].includes(radix)||!finite(selectedRippleFraction)||
    selectedRippleFraction<-.1||selectedRippleFraction>.1||!finite(temperatureC)||
    temperatureC< -40||temperatureC>125)
  throw Error('Unrecognized bounded foundry rail/corner request');
 const nominal=makeVoltageRails({base:radix,minimumV:0,maximumV:source.nominalV});
 const peak=source.nominalV*(1+selectedRippleFraction);
 const rails=makeVoltageRails({base:radix,minimumV:0,maximumV:peak});
 return {format:SOA_FORMAT,id,pdk:source.pdk,
  pdkSourceCommit:PDK_SOURCES[source.pdk].commit,
  modelLibrary:PDK_SOURCES[source.pdk].modelLibrary,
  deviceModels:[source.n,source.p,...source.extra],polarityModels:{
   n:source.n,p:source.p
  },radix,temperatureC,rippleFraction:selectedRippleFraction,
  maximumSpecifiedRippleFraction:source.maximumSpecifiedRippleFraction,
  regulationMode:source.regulator,
  rippleSpecificationMet:Math.abs(selectedRippleFraction)<=
   source.maximumSpecifiedRippleFraction+1e-12,
  worstCaseSupplyEnvelopeV:{minimum:source.nominalV*(1-Math.abs(selectedRippleFraction)),
   maximum:source.nominalV*(1+Math.abs(selectedRippleFraction))},
  nominalRailsV:nominal.rails,railsV:rails.rails,
  voltageRange:'MODEL_OPERATING_RANGE_NOT_BREAKDOWN_CERTIFICATION',
  completePinnedPdkDependenciesAvailable:false,
  calibratedDeviceVariationAvailable:false,
  transistorALUNetlistAvailable:false,
  physicalQualification:'UNQUALIFIED_NO_GO'};
}
export function verifyMosTerminalSOA({model,samples}={}){
 const limit=MOS_SOA_LIMITS[model];
 if(!limit||!Array.isArray(samples)||samples.length<1||samples.length>100000)
  return {format:SOA_FORMAT,status:'SOA_INSUFFICIENT_NODE_BOUNDS',
   reason:'model-unknown-or-bounded-terminal-samples-unavailable',model};
 const violations=[],peak={Vgs:0,Vds:0,Vgb:0,Vgd:0,Vbs:0};
 for(let i=0;i<samples.length;i++){
  const s=samples[i];
  if(!s||!['gateV','drainV','sourceV','bodyV'].every(k=>finite(s[k])))
   return {format:SOA_FORMAT,status:'SOA_INSUFFICIENT_NODE_BOUNDS',
    reason:'missing-four-terminal-finite-voltages',model,sample:i};
  const vgs=s.gateV-s.sourceV,vds=s.drainV-s.sourceV,
   vgb=s.gateV-s.bodyV,vgd=s.gateV-s.drainV,
   vbs=s.bodyV-s.sourceV;
  for(const [key,v] of Object.entries({Vgs:vgs,Vds:vds,Vgb:vgb,Vgd:vgd,Vbs:vbs}))
   peak[key]=Math.max(peak[key],Math.abs(v));
  const check={
   Vgs:Math.abs(vgs)<=limit.maxGateV+1e-10,
   Vds:Math.abs(vds)<=limit.maxDrainV+1e-10,
   Vgb:Math.abs(vgb)<=limit.maxGateV+1e-10,
   Vgd:Math.abs(vgd)<=limit.maxGateV+1e-10,
   Vbs:within(vbs,limit.minVbs,limit.maxVbs)
  };
  if(limit.polarity==='n'&&(vds< -1e-10||vgs< -1e-10)||
     limit.polarity==='p'&&(vds>1e-10||vgs>1e-10))
   violations.push({sample:i,terminal:'polarity',actualV:{Vgs:vgs,Vds:vds},
    reason:'model-biased-outside-polarity-domain'});
  for(const [terminal,ok] of Object.entries(check))
   if(!ok)violations.push({sample:i,terminal,actualV:
    {Vgs:vgs,Vds:vds,Vgb:vgb,Vgd:vgd,Vbs:vbs}[terminal],
    maximumV:terminal==='Vds'?limit.maxDrainV:
     terminal==='Vbs'?null:limit.maxGateV});
 }
 return {format:SOA_FORMAT,model,pdk:limit.pdk,
  status:violations.length?'SOA_OXIDE_OVERSTRESS':'SOA_MODEL_RANGE_SCREEN_PASS',
  peakAbsoluteTerminalVoltagesV:peak,violations,
  sourceUrl:limit.sourceUrl,deviceLimitModelOnly:true,
  fullTimeDomainMonitored:false,physicalQualification:'UNQUALIFIED_NO_GO'};
}
export function verifyProfileSOA(profile){
 if(profile?.format!==SOA_FORMAT||!PROFILE_MAP[profile.id]||
    profile.radix<2||profile.radix>4||
    !Array.isArray(profile.railsV))
  throw Error('Explicit known foundry rail profile required');
 const v=profile.railsV.at(-1);
 if(!finite(v)||v<=0)throw Error('Invalid profile maximum rail');
 // Complementary CMOS inverter terminal extremes, conservative supply
 // screens for every transistor family in the declared profile. This does
 // not establish all time-varying device node voltages in a real ALU.
 const findings=profile.deviceModels.map(model=>{
  const kind=MOS_SOA_LIMITS[model]?.polarity;
  if(!kind)return verifyMosTerminalSOA({model,samples:[]});
  const samples=kind==='n'?
   [{gateV:0,drainV:v,sourceV:0,bodyV:0},
    {gateV:v,drainV:0,sourceV:0,bodyV:0},
    {gateV:v,drainV:v,sourceV:0,bodyV:0}]:
   [{gateV:0,drainV:0,sourceV:v,bodyV:v},
    {gateV:v,drainV:0,sourceV:v,bodyV:v},
    {gateV:0,drainV:v,sourceV:v,bodyV:v}];
  return verifyMosTerminalSOA({model,samples});
 });
 const fail=findings.some(x=>x.status==='SOA_OXIDE_OVERSTRESS');
 const outOfRegulation=profile.rippleSpecificationMet===false;
 return {format:SOA_FORMAT,profileId:profile.id,
  status:fail?'SOA_OXIDE_OVERSTRESS':
   findings.some(x=>x.status!=='SOA_MODEL_RANGE_SCREEN_PASS')?
    'SOA_INSUFFICIENT_NODE_BOUNDS':
    outOfRegulation?'SOA_REGULATOR_RIPPLE_SPEC_EXCEEDED':'SOA_PROFILE_SCREEN_PASS',
  findings,profile:profile.nominalRailsV,
  maximumSpecifiedRippleFraction:profile.maximumSpecifiedRippleFraction,
  rippleSpecificationMet:profile.rippleSpecificationMet,
  note:'Only static worst-case nominal node envelopes; PDK model validity and full transistor nodal stresses remain unverified',
  transistorQualification:false,physicalQualification:'UNQUALIFIED_NO_GO'};
}
export function requireSafeNetlistSOA({profile,devices,corner='tt'}={}){
 if(profile?.format!==SOA_FORMAT||!Array.isArray(devices)||
    !(profile.pdk==='GF180MCU'?
      ['typical','ss','ff'].includes(corner):
      ['tt','ss','ff','tt_mm'].includes(corner)))
  throw Error('Explicit candidate foundry profile and corner required');
 if(devices.length<1||devices.length>100000)
  return {format:SOA_FORMAT,status:'SOA_INSUFFICIENT_NODE_BOUNDS',
   reason:'complete-list-of-transistor-devices-required'};
 const whitelisted=new Set(profile.deviceModels);
 const findings=devices.map((d,i)=>{
  const r=whitelisted.has(d?.model)?verifyMosTerminalSOA(d):
   {format:SOA_FORMAT,status:'SOA_INSUFFICIENT_NODE_BOUNDS',
    reason:'non-profile-device-or-unmapped-netlist-model',model:d?.model};
  return {device:i,...r};
 });
 const bad=findings.some(x=>x.status==='SOA_OXIDE_OVERSTRESS');
 const incomplete=findings.some(x=>x.status==='SOA_INSUFFICIENT_NODE_BOUNDS');
 return {format:SOA_FORMAT,profileId:profile.id,corner,
  status:bad?'SOA_OXIDE_OVERSTRESS':
   incomplete?'SOA_INSUFFICIENT_NODE_BOUNDS':
   'SOA_MODEL_RANGE_SCREEN_PASS',
  findings,
  completeTransistorConnectivityProven:false,
  physicalQualification:'UNQUALIFIED_NO_GO'};
}
