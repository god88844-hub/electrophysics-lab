import {isDeepStrictEqual} from 'node:util';
export const FORMAT='invention-lab/phase52-reference-system-qualification-plan/1';
const ids=["purchased-source-matched-battery-and-motor-specimens","identified-fan-impeller-and-rated-max-rpm","verified-shaft-attachment-and-protective-containment","independent-current-fault-and-thermal-protection","calibrated-pack-motor-and-load-instruments","measured-wire-contact-resistance-and-temperature","actual-pressure-flow-and-fan-load-curves","measured-startup-and-stalled-rotor-response","independent-battery-thermal-aging-sweep","actual-assembly-temperature-and-energy-traces","device-lot-separated-blind-physical-holdout","preregistered-uncertainty-and-safety-release-review"];
const paths=['benchmarks/phase41/reference-hardware-candidate.json','benchmarks/phase42/physical-capture-protocol.json','benchmarks/phase48/whole-system-readiness.json','benchmarks/phase51/fault-model-scope.json'];
const requireOk=(x,msg)=>{if(!x)throw Error(msg)};
const freeze=x=>{if(x&&typeof x==='object'){for(const v of Object.values(x))freeze(v);Object.freeze(x)}return x};
export function verifyReferencePlan(plan,source){
 const expected={format:FORMAT,referenceDesignId:'reference-3v-battery-2-wire-brushed-fan-candidate-001',
 evaluationKind:'PLANNED_SOURCE_MATCHED_PHYSICAL_GATES_NOT_HARDWARE_APPROVAL',
 softwareModels:paths,requiredPhysicalGates:ids.map(id=>({id,verified:false,evidence:null,independentReview:null})),
 pendingApprovedComponentBOM:false,actualInstrumentSessions:0,actualSourceMatchedPhysicalSpecimens:0,
 independentlyCalibratedOperatingEnvelope:null,manufacturerSuccessPercent:null,
 physicalBuildPermitted:false,impellerOperationPermitted:false,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
 requireOk(isDeepStrictEqual(plan,expected),'Reference physical acceptance policy weakened or changed');
 requireOk(source?.hardware?.designId===plan.referenceDesignId&&
 source.hardware.motor?.listingStatus==='discontinued'&&source.hardware.fan?.partNumber===null&&
 source.hardware.actualPhysicalFanMeasurements===0&&
 source.hardware.physicalValidation==='none','Actual reference motor/impeller physical source mismatch');
 requireOk(source.capture?.referenceDesignId===plan.referenceDesignId&&
 source.capture.actualSourceMatchedFanMeasurements===0&&
 source.capture.independentInstrumentCalibrationAccepted===false,
 'Capture source unexpectedly contains alleged qualified specimens');
 requireOk(source.whole?.referenceDesignId===plan.referenceDesignId&&
 source.whole.originalPhysicalSamples===0&&
 source.whole.actualPhysicalWholeSystemValidationComplete===false,
 'Prior whole-system qualification evidence falsely cleared');
 requireOk(source.fault?.referenceDesignId===plan.referenceDesignId&&
 source.fault.realUnitFailureCounts===0&&source.fault.physicalAssemblyFaultTestApproved===false,
 'Measured failure evidence or safety approval falsely inferred');
 return true;
}
export function assessReferenceSystem(plan,source,candidate=null){
 verifyReferencePlan(plan,source);
 const supplied=candidate&&typeof candidate==='object'&&!Array.isArray(candidate)?candidate:null;
 const claims=supplied?Object.keys(supplied).sort():[];
 const overlap=plan.requiredPhysicalGates.map(x=>x.id);
 return freeze({format:'invention-lab/phase52-physical-release-decision/1',
 referenceDesignId:plan.referenceDesignId,softwareSourceComparisonComplete:true,
 physicalGateCount:overlap.length,missingPhysicalGates:overlap,
 claimedExternalMetadataFields:claims,
 candidateMetadataIndependentlyAuthenticated:false,
 auditedOriginalHardwareRecords:0,qualifiedActualSpecimens:0,
 releaseDecision:'NO_GO_MISSING_REAL_ASSEMBLY_AND_SAFETY_EVIDENCE',
 authorizationToSpinOrEnergizeImpeller:false,
 predictedPhysicalSuccessRatePercent:null,physicalPredictionInterval:null,
 physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null});
}
