import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyCaptureProtocol,blankCaptureEvidence} from '../js/measure/phase42-capture-gate.js';
import {verifyReferenceCandidate,assessReferenceCandidate} from '../js/evidence/phase41-hardware-readiness.js';
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=async f=>readFile(f);
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const protocolRaw=await read('benchmarks/phase42/physical-capture-protocol.json');
const hardwareRaw=await read('benchmarks/phase41/reference-hardware-candidate.json');
const protocol=JSON.parse(protocolRaw),hardware=JSON.parse(hardwareRaw);
verifyCaptureProtocol(protocol);verifyReferenceCandidate(hardware);
const candidate=assessReferenceCandidate(hardware),evidence=blankCaptureEvidence(protocol);
if(candidate.safeToBuildOrSpin!==false||candidate.originalHardwareBOMFrozen!==false||
 evidence.hardwareBuildAuthorized!==false||evidence.originalPhysicalFanSensorReadings!==0)
 throw Error('No source-matched physical hardware has been independently qualified');
const report={
 format:'invention-lab/phase42-zero-measurement-protocol-readiness-report/1',
 sourceCommit,protocolSha256:hash(protocolRaw),candidateHardwareSha256:hash(hardwareRaw),
 referenceDesignId:protocol.referenceDesignId,protocol:protocol.protocolVersion,
 manufacturerResearchCandidateReady:true,physicalAssemblyFrozen:false,
 originalInstrumentFilesRecorded:0,physicalSpecimensObserved:0,
 capturePlanningOnly:true,externalMechanicalSafetyApproval:false,
 calibratedPhysicalInstrumentReportsAccepted:0,
 hardwareReadiness: candidate.readiness,
 missingPrerequisites:protocol.prerequisites,
 emptyPhysicalCapture:evidence,
 physicalValidation:'none',physicalVerdict:'unknown',
 realWorldBuildSuccessPercent:null
};
await mkdir('benchmarks/evidence/phase42',{recursive:true});
await writeFile('benchmarks/evidence/phase42/phase42.json',JSON.stringify(report,null,2)+'\n');
console.log('PH42 PASS: physical capture schema and safety gates reproducible; actual matched fan physical readings = 0; qualification UNKNOWN');