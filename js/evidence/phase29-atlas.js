// Phase29: domain-specific evidence reference atlas + live diagram passport.
// A source link to a previous workflow is not evidence for the user's diagram.
// Both source references and the editable WebGL scene are strictly model-only.
import {summarizeDesignEvidence} from './feasibility.js';
import {getComponent} from '../core/registry.js';

export const ATLAS_FORMAT='invention-lab/phase29-reference-atlas/1';
export const PASSPORT_FORMAT='invention-lab/phase29-design-evidence-passport/1';
export const REFERENCE_SOURCE_COMMIT='6cd73819573f419d79f9fb19af58b932f87aff4b';
export const REFERENCE_CATALOG=Object.freeze([
  {
    "id": "logic-mapped-sat",
    "labs": [
      "logic",
      "chip"
    ],
    "kind": "independent-formal",
    "title": "Final ALU mapped-gate Boolean proof",
    "source": "docs/PHASE22-FEOL-POSTGDS-FORMAL.md",
    "summary": "Yosys SAT compares the fixed SKY130 ALU post-GDS gate netlist with a separate specification and detects a deliberate faulty specification. Does not prove this diagram or real silicon.",
    "url": "https://github.com/god88844-hub/invention-lab/blob/6cd73819573f419d79f9fb19af58b932f87aff4b/docs/PHASE22-FEOL-POSTGDS-FORMAL.md",
    "origin": "historical-repository-reference",
    "appliesToActiveDiagram": false,
    "hardwareValidation": "none"
  },
  {
    "id": "chip-postroute-pvt",
    "labs": [
      "chip"
    ],
    "kind": "tool-model",
    "title": "SKY130 post-route PVT static timing",
    "source": "docs/PHASE20-POSTROUTE-PVT.md",
    "summary": "OpenROAD/OpenSTA three standard-cell Liberty PVT corners and one extracted RC view for the separate ALU example; neither silicon timing nor general chip performance.",
    "url": "https://github.com/god88844-hub/invention-lab/blob/6cd73819573f419d79f9fb19af58b932f87aff4b/docs/PHASE20-POSTROUTE-PVT.md",
    "origin": "historical-repository-reference",
    "appliesToActiveDiagram": false,
    "hardwareValidation": "none"
  },
  {
    "id": "chip-open-drc",
    "labs": [
      "chip"
    ],
    "kind": "experimental-layout",
    "title": "Experimental GDS DRC / netlist LVS",
    "source": "docs/PHASE21-OPEN-LAYOUT-AUDIT.md",
    "summary": "Open experimental SKY130 geometry subset and final-cell CDL connectivity only; not foundry-qualified production signoff.",
    "url": "https://github.com/god88844-hub/invention-lab/blob/6cd73819573f419d79f9fb19af58b932f87aff4b/docs/PHASE21-OPEN-LAYOUT-AUDIT.md",
    "origin": "historical-repository-reference",
    "appliesToActiveDiagram": false,
    "hardwareValidation": "none"
  },
  {
    "id": "device-published-iv",
    "labs": [
      "chip"
    ],
    "kind": "other-device-measurement",
    "title": "Published resistor I–V measurements",
    "source": "docs/PHASE25-BOUNDED-CALIBRATION.md",
    "summary": "Two independently identified poly-resistor test-tile devices (102 readings); not measurements of the active diagram or ALU.",
    "url": "https://github.com/god88844-hub/invention-lab/blob/6cd73819573f419d79f9fb19af58b932f87aff4b/docs/PHASE25-BOUNDED-CALIBRATION.md",
    "origin": "historical-repository-reference",
    "appliesToActiveDiagram": false,
    "hardwareValidation": "none"
  },
  {
    "id": "chip-nogo",
    "labs": [
      "chip"
    ],
    "kind": "release-blocker",
    "title": "ALU physical go / no-go evidence",
    "source": "docs/PHASE28-ENGINEERING-GO-NOGO.md",
    "summary": "Actual ALU dies and physical measurements absent; numerical manufacturing success is unknown. This is a blocked gate, not a silicon failure.",
    "url": "https://github.com/god88844-hub/invention-lab/blob/6cd73819573f419d79f9fb19af58b932f87aff4b/docs/PHASE28-ENGINEERING-GO-NOGO.md",
    "origin": "historical-repository-reference",
    "appliesToActiveDiagram": false,
    "hardwareValidation": "none"
  },
  {
    "id": "rv32-qemu",
    "labs": [
      "rv32i"
    ],
    "kind": "independent-reference",
    "title": "RV32M QEMU differential reference",
    "source": "docs/PHASE8-RV32M-VALIDATION.md",
    "summary": "Independent architectural reference cases for RV32IM instruction behavior; not hardware cycle timing or fabricated CPU evidence.",
    "url": "https://github.com/god88844-hub/invention-lab/blob/6cd73819573f419d79f9fb19af58b932f87aff4b/docs/PHASE8-RV32M-VALIDATION.md",
    "origin": "historical-repository-reference",
    "appliesToActiveDiagram": false,
    "hardwareValidation": "none"
  },
  {
    "id": "cpu-architecture",
    "labs": [
      "cpu"
    ],
    "kind": "bounded-model",
    "title": "IL-8 architectural execution model",
    "source": "js/labs/cpu/cpu.js",
    "summary": "Software functional and pipeline simulator. The fixed software test suite does not validate real CPU silicon.",
    "url": "https://github.com/god88844-hub/invention-lab/blob/6cd73819573f419d79f9fb19af58b932f87aff4b/js/labs/cpu/cpu.js",
    "origin": "historical-repository-reference",
    "appliesToActiveDiagram": false,
    "hardwareValidation": "none"
  },
  {
    "id": "ai-onnx",
    "labs": [
      "ai"
    ],
    "kind": "independent-reference",
    "title": "ONNX Runtime CPU operator checks",
    "source": "docs/PHASE9-ONNX-INFERENCE.md",
    "summary": "Reference operator results from CPU-backed ONNX Runtime for fixed test cases, not GPU/TPU throughput or fabricated hardware.",
    "url": "https://github.com/god88844-hub/invention-lab/blob/6cd73819573f419d79f9fb19af58b932f87aff4b/docs/PHASE9-ONNX-INFERENCE.md",
    "origin": "historical-repository-reference",
    "appliesToActiveDiagram": false,
    "hardwareValidation": "none"
  },
  {
    "id": "ai-quant-conv",
    "labs": [
      "ai"
    ],
    "kind": "independent-reference",
    "title": "ONNX quantization and convolution checks",
    "source": "docs/PHASE11-CONV-AND-PER-AXIS.md",
    "summary": "External operator arithmetic comparisons for bounded fixed quantized cases; device hardware power and latency remain unmeasured.",
    "url": "https://github.com/god88844-hub/invention-lab/blob/6cd73819573f419d79f9fb19af58b932f87aff4b/docs/PHASE11-CONV-AND-PER-AXIS.md",
    "origin": "historical-repository-reference",
    "appliesToActiveDiagram": false,
    "hardwareValidation": "none"
  },
  {
    "id": "ai-iris",
    "labs": [
      "ai"
    ],
    "kind": "public-ml-holdout",
    "title": "Iris public dataset model holdout",
    "source": "docs/PHASE12-IRIS-MODEL-VALIDATION.md",
    "summary": "A fixed labeled real dataset and model-level unseen records test prediction behavior, not chip or accelerator accuracy.",
    "url": "https://github.com/god88844-hub/invention-lab/blob/6cd73819573f419d79f9fb19af58b932f87aff4b/docs/PHASE12-IRIS-MODEL-VALIDATION.md",
    "origin": "historical-repository-reference",
    "appliesToActiveDiagram": false,
    "hardwareValidation": "none"
  },
  {
    "id": "quant-numerical",
    "labs": [
      "quantum"
    ],
    "kind": "numerical-reference",
    "title": "Quantum numerical comparison snapshot",
    "source": "benchmarks/evidence/latest-quantum.json",
    "summary": "Repository numerical-reference snapshot for bounded simulated quantum circuits; not a measured physical qubit experiment.",
    "url": "https://github.com/god88844-hub/invention-lab/blob/6cd73819573f419d79f9fb19af58b932f87aff4b/benchmarks/evidence/latest-quantum.json",
    "origin": "historical-repository-reference",
    "appliesToActiveDiagram": false,
    "hardwareValidation": "none"
  },
  {
    "id": "cross-adapters",
    "labs": [
      "crosslab"
    ],
    "kind": "software-only",
    "title": "Cross-lab adapter examples",
    "source": "js/examples/crosslab.js",
    "summary": "Software adapters compare independently calculated cross-domain outputs but do not create hardware measurement evidence.",
    "url": "https://github.com/god88844-hub/invention-lab/blob/6cd73819573f419d79f9fb19af58b932f87aff4b/js/examples/crosslab.js",
    "origin": "historical-repository-reference",
    "appliesToActiveDiagram": false,
    "hardwareValidation": "none"
  }
]);
export const KNOWN_LABS=Object.freeze(['logic','chip','cpu','rv32i','ai','quantum','optics','crosslab']);

function copy(value){return JSON.parse(JSON.stringify(value));}
function scope(labId){
 const matches=REFERENCE_CATALOG.filter(x=>x.labs.includes(labId));
 return {
  format:ATLAS_FORMAT,
  labId,
  referenceCommit:REFERENCE_SOURCE_COMMIT,
  historicalReferences:copy(matches),
  sourceScope:'historical, separate fixed examples; not revalidated for the current user diagram',
  currentUserPhysicalQualification:'none',
  deviceMeasurementsOfActiveDiagram:0,
  physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null
 };
}
export function atlasForLab(labId){
 if(!KNOWN_LABS.includes(labId))throw Error('Unknown invention lab cannot inherit historical proof: '+String(labId));
 return scope(labId);
}
export function buildEvidencePassport({labId,diagram=null,report=null,viewMode='2d',selectedBlockId=null}={}){
 const atlas=atlasForLab(labId);
 if(viewMode!=='2d'&&viewMode!=='3d')throw Error('Invalid source workspace view');
 if(labId==='crosslab'&&diagram!==null)throw Error('Cross-lab adapters are not one canonical diagram');
 if(labId!=='crosslab'&&(!diagram||diagram.lab!==labId||typeof diagram.toJSON!=='function'))
  throw Error('Evidence passport must bind to the exact current lab diagram');
 if(labId==='crosslab'){
  return {format:PASSPORT_FORMAT,labId,viewMode:'2d',currentDesign:null,
   currentComponent:null,atlas,currentDesignEvidenceStatus:'no-single-current-design',
   physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null,
   releaseDecision:'NOT_QUALIFIED'};
 }
 const design=copy(diagram.toJSON());
 if(design.lab!==labId||!Array.isArray(design.blocks)||!Array.isArray(design.wires))
  throw Error('Diagram failed snapshot/source identity check');
 const evidence=summarizeDesignEvidence({diagram,report});
 let selected=null;
 if(selectedBlockId!==null){
  const block=design.blocks.find(x=>x.id===selectedBlockId);
  if(block){
   const definition=getComponent(block.type);
   selected={id:block.id,type:block.type,
    label:definition?.label??block.type,
    modelProvenance:definition?.validation?.provenance??null,
    sourceScope:'local model component only',
    physicalValidation:'none',physicalVerdict:'unknown'};
  }
 }
 return {format:PASSPORT_FORMAT,labId,viewMode,
  currentDesign:{
   diagramId:design.id,name:design.name,
   blockCount:design.blocks.length,wireCount:design.wires.length,
   exactDiagramSnapshot:design,
   simulationReportVerdict:report?.verdict??'not-tested',
   simulationCounts:evidence.checks,
   reportSnapshot:report===null?null:copy(report)
  },
  currentComponent:selected,
  atlas,
  currentDesignEvidenceStatus:'computational-model-only',
  referenceCasesLinkedToCurrentDesign:0,
  originalPhysicalMeasurementsForCurrentDesign:0,
  independentFoundrySignoffForCurrentDesign:false,
  reliabilityEstimate:null,hardwareAccuracyEstimate:null,
  physicalValidation:'none',physicalVerdict:'unknown',
  realWorldBuildSuccessPercent:null,releaseDecision:'NOT_QUALIFIED'};
}
