// Phase 73: PDK source inventory and functional radix primitives.
// PDK references are authentic upstream FILE LOCATIONS, NOT downloaded/calibrated devices.
export const PHASE73_FORMAT='invention-lab/phase73-mvl-foundry-source-catalog/1';
export const PDK_SOURCES=Object.freeze({
 SKY130:Object.freeze({
  repository:'https://github.com/google/skywater-pdk-libs-sky130_fd_pr',
  commit:'f62031a1be9aefe902d6d54cddd6f59b57627436',
  modelLibrary:'models/sky130.lib.spice',
  supportedCorners:['tt','ss','ff','sf','fs'],
  nominalSupplyV:1.8,license:'Apache-2.0',
  // SKY130 library's 1v8 devices cannot be used as 3.3V-rated Q4 transistors.
  statisticalModelValidated:false,
  units:'V / degree C'
 }),
 GF180MCU:Object.freeze({
  repository:'https://github.com/google/globalfoundries-pdk-libs-gf180mcu_fd_pr',
  commit:'9f992d5a9186d1f7820c58f039c484ad35b2edea',
  modelLibrary:'models/ngspice/design.ngspice',
  modelBlob:'models/ngspice/sm141064.ngspice',
  supportedCorners:['tt','ss','ff'],nominalSupplyV:3.3,license:'Apache-2.0',
  statisticalModelValidated:false,units:'V / degree C'
 })
});
const devices=[
 ['sky130_nfet_standard','SKY130','sky130_fd_pr__nfet_01v8','nmos','standard',1.8],
 ['sky130_nfet_lvt','SKY130','sky130_fd_pr__nfet_01v8_lvt','nmos','lvt',1.8],
 ['sky130_pfet_standard','SKY130','sky130_fd_pr__pfet_01v8','pmos','standard',1.8],
 ['sky130_pfet_hvt','SKY130','sky130_fd_pr__pfet_01v8_hvt','pmos','hvt',1.8],
 ['sky130_poly_resistor','SKY130','sky130_fd_pr__res_high_po','resistor','standard',1.8],
 ['gf180_nfet_03v3','GF180MCU','gf180mcu_fd_pr__nfet_03v3','nmos','standard',3.3],
 ['gf180_pfet_03v3','GF180MCU','gf180mcu_fd_pr__pfet_03v3','pmos','standard',3.3],
 ['gf180_resistor_unresolved','GF180MCU',null,'resistor','unresolved',3.3]
];
export const PDK_DEVICE_CATALOG=Object.freeze(devices.map(([id,pdk,modelName,kind,thresholdClass,nominalSupplyV])=>Object.freeze({
 id,pdk,modelName,kind,thresholdClass,nominalSupplyV,
 sourceCommit:PDK_SOURCES[pdk].commit,
 sourceRepository:PDK_SOURCES[pdk].repository,
 cornerSet:PDK_SOURCES[pdk].supportedCorners,
 // The peak-voltage envelope, statistical params, actual local library hashes,
 // valid temperatures and actual cell implementation need independent verification.
 verifiedPeakVoltageV:null,verifiedTemperatureC:null,
 // A modelName may be null when the exact upstream SPICE subcircuit
 // has not been independently mapped; never invent a device name.

 localModelSha256:null,validatedStatisticalDistribution:false,
 fittedFromSilicon:false,hasVerifiedCellImplementation:false
})));
const num=(n,name)=>{if(typeof n!=='number'||!Number.isFinite(n))throw Error('Nonfinite '+name);return n;};
export function makeVoltageRails({base=4,minimumV=0,maximumV=3.3,balancedTernary=false}={}){
 if(!Number.isInteger(base)||base<2||base>16)throw Error('Radix must be integer 2..16');
 num(minimumV,'minimumV');num(maximumV,'maximumV');
 if(!(maximumV>minimumV)||maximumV-minimumV>15)throw Error('Invalid voltage range');
 if(balancedTernary&&(base!==3||minimumV!==-maximumV))throw Error('Balanced ternary requires [-V,0,+V]');
 const spacing=(maximumV-minimumV)/(base-1);
 const rails=Array.from({length:base},(_,i)=>+(minimumV+spacing*i).toFixed(12));
 return Object.freeze({base,rails,spacingV:spacing,balancedTernary,levelKind:'ideal-functional-only',
  transistorImplementationVerified:false});
}
export const Q4_RAILS=makeVoltageRails({base:4,minimumV:0,maximumV:3.3});
export const BALANCED_TERNARY_RAILS=makeVoltageRails({base:3,minimumV:-1.1,maximumV:1.1,balancedTernary:true});
export function decodeVoltage(value,configuration,{guardBandV=0}={}){
 num(value,'input voltage');num(guardBandV,'guard band');
 if(guardBandV<0)throw Error('Negative guard band');
 const rails=configuration?.rails;
 if(!Array.isArray(rails)||rails.length<2)throw Error('Explicit radix rails required');
 if(rails.some(x=>typeof x!=='number'||!Number.isFinite(x)))throw Error('Invalid rail');
 if(rails.some((x,i)=>i>0&&x<=rails[i-1]))throw Error('Rails must rise strictly');
 const boundaries=rails.slice(1).map((v,i)=>(v+rails[i])/2);
 if(value<rails[0]-1e-12||value>rails.at(-1)+1e-12||
    boundaries.some(x=>Math.abs(value-x)<=guardBandV+1e-12))
  return {status:'UNKNOWN',level:null,reason:'outside-rails-or-boundary-ambiguity'};
 const level=boundaries.filter(x=>value>x).length;
 return {status:'RESOLVED',level,logicalValue:configuration.balancedTernary?level-1:level};
}
export function buildMvlPrimitive({kind,rails}){
 if(!['detector','level-shifter','identity','complement','min','max'].includes(kind))
  throw Error('Unsupported MVL primitive');
 if(!Array.isArray(rails?.rails)||rails.rails.length<2)
  throw Error('MVL primitive needs validated functional rails');
 return {kind,base:rails.base,railsV:rails.rails.slice(),
  status:'FUNCTIONAL_ONLY',transistorNetlist:null,spiceCalibrated:false};
}

// Functional voltage detector/shifter, not a transistor implementation.
// Unknown analog state propagates UNKNOWN rather than snapping to a rail.
export function evaluateMvlPrimitive({kind,sourceRails,targetRails=null,
 inputVoltages,guardBandV=0}={}){
 if(!['detector','level-shifter','identity','complement','min','max'].includes(kind))
  throw Error('Unsupported MVL primitive kind');
 if(!sourceRails||!Array.isArray(sourceRails.rails)||!Number.isInteger(sourceRails.base))
  throw Error('Explicit source radix rails required');
 const inputs=kind==='min'||kind==='max'?2:1;
 if(!Array.isArray(inputVoltages)||inputVoltages.length!==inputs)
  throw Error('Incorrect MVL input count');
 const decoded=inputVoltages.map(v=>decodeVoltage(v,sourceRails,{guardBandV}));
 if(decoded.some(x=>x.status!=='RESOLVED'))
  return {status:'UNKNOWN',reason:'input-state-ambiguous-or-out-of-rails',
   outputVoltageV:null,logicLevel:null,model:'ideal-functional-only'};
 let level=decoded[0].level;
 if(kind==='complement')level=sourceRails.base-1-level;
 if(kind==='min')level=Math.min(...decoded.map(x=>x.level));
 if(kind==='max')level=Math.max(...decoded.map(x=>x.level));
 const outputRails=targetRails??sourceRails;
 if(outputRails.base!==sourceRails.base||!Array.isArray(outputRails.rails)||
    outputRails.rails.length!==sourceRails.base)
  throw Error('Source and destination base must match for an ideal level-shifter');
 return {status:'RESOLVED_FUNCTIONAL_ONLY',logicLevel:level,
  logicalValue:outputRails.balancedTernary?level-1:level,
  outputVoltageV:outputRails.rails[level],
  model:'ideal-functional-only',transistorNetlist:null,
  foundryCalibrated:false,physicalValidation:'none'};
}

export function evaluateRadixAlu({base,width,a,b,operation}){
 if(!Number.isInteger(base)||base<2||base>16||![4,8].includes(width))
  throw Error('ALU supports 4- and 8-digit radix 2..16 functional tests');
 if(!Array.isArray(a)||!Array.isArray(b)||a.length!==width||b.length!==width)
  throw Error('Expected exact radix operand vectors');
 if([...a,...b].some(x=>!Number.isInteger(x)||x<0||x>=base))
  throw Error('Invalid radix digit');
 const load=arr=>arr.reduce((acc,v)=>acc*BigInt(base)+BigInt(v),0n);
 const A=load(a),B=load(b),modulus=BigInt(base)**BigInt(width);
 let raw;
 if(operation==='add')raw=A+B;
 else if(operation==='sub')raw=(A-B+modulus)%modulus;
 else if(operation==='min')raw=A<B?A:B;
 else if(operation==='max')raw=A>B?A:B;
 else throw Error('Unsupported radix ALU operation');
 const overflow=raw>=modulus;
 let n=raw%modulus;const digits=Array(width).fill(0);
 for(let i=width-1;i>=0;i--){digits[i]=Number(n%BigInt(base));n/=BigInt(base);}
 return {format:'invention-lab/phase73-functional-alu/1',base,width,digits,
  overflow,model:'mathematical-reference-not-a-transistor-netlist',
  powerWatts:null,delaySeconds:null,physicalValidation:'none'};
}
export function validateDeviceOperatingEnvelope(deviceId,{rails,temperatureC=25,supplyRippleFraction=0}={}){
 const d=PDK_DEVICE_CATALOG.find(x=>x.id===deviceId);
 if(!d)throw Error('Unknown foundry device identifier');
 num(temperatureC,'temperatureC');num(supplyRippleFraction,'supplyRippleFraction');
 if(supplyRippleFraction<0||supplyRippleFraction>.5)throw Error('Ripple out of bounded range');
 const maxRail=Math.max(...(rails?.rails||[])),minRail=Math.min(...(rails?.rails||[]));
 if(!Number.isFinite(maxRail)||!Number.isFinite(minRail))throw Error('Missing voltage rails');
 const requestedPeakV=Math.max(Math.abs(maxRail),Math.abs(minRail))*(1+supplyRippleFraction);
 const nominalExceeded=requestedPeakV>d.nominalSupplyV+1e-9;
 return {deviceId,pdk:d.pdk,requestedPeakV,
  nominalExceeded,physicallyQualified:false,
  usableForTransistorSimulation:false,
  status:'INSUFFICIENT_MODEL_DATA',
  reasons:[
   ...(nominalExceeded?['request-exceeds-device-nominal-supply']:[]),
   'model-files-and-operating-absolute-ratings-not-authenticated',
   'model-statistics-and-temperature-validity-not-calibrated'
  ]};
}
