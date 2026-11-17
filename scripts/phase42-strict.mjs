import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const hash=b=>createHash('sha256').update(b).digest('hex');
const txt=async path=>readFile(path);
const protocolRaw=await txt('benchmarks/phase42/physical-capture-protocol.json');
const hardwareRaw=await txt('benchmarks/phase41/reference-hardware-candidate.json');
const p=JSON.parse(protocolRaw),h=JSON.parse(hardwareRaw);
const s=JSON.parse(await txt('benchmarks/evidence/phase42/phase42.json'));
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const req=(ok,msg)=>{if(!ok)throw Error('PH42 STRICT: '+msg)};
req(s.format==='invention-lab/phase42-zero-measurement-protocol-readiness-report/1',
 'Protocol report format changed');
req(s.sourceCommit===head,'Output does not match source HEAD');
req(s.protocolSha256===hash(protocolRaw)&&s.candidateHardwareSha256===hash(hardwareRaw),
 'Source protocol or hardware candidate was replaced');
req(s.referenceDesignId===p.referenceDesignId&&s.referenceDesignId===h.designId,
 'Wrong hardware assembly identity');
req(p.captureState==='PLANNED_NO_HARDWARE_OR_REAL_MEASUREMENTS'&&
 h.status==='CANDIDATE_NOT_FROZEN_NOT_PURCHASED_NOT_BUILT',
 'Unobserved experimental data was forged');
req(s.originalInstrumentFilesRecorded===0&&s.physicalSpecimensObserved===0&&
 s.calibratedPhysicalInstrumentReportsAccepted===0&&s.capturePlanningOnly===true&&
 s.physicalAssemblyFrozen===false&&s.externalMechanicalSafetyApproval===false,
 'No real observed or approved hardware can be claimed');
req(Array.isArray(s.missingPrerequisites)&&s.missingPrerequisites.length===6,
 'Real experiment prerequisites removed');
req(s.emptyPhysicalCapture?.sourceMatchedSessionsRecorded===0&&
 s.emptyPhysicalCapture?.sourceMatchedIndependentSpecimens===0&&
 s.emptyPhysicalCapture?.originalPhysicalFanSensorReadings===0&&
 s.emptyPhysicalCapture?.acquiredOriginalInstrumentFiles===0&&
 s.emptyPhysicalCapture?.hardwareBuildAuthorized===false&&
 s.emptyPhysicalCapture?.physicalValidation==='none'&&
 s.emptyPhysicalCapture?.realWorldBuildSuccessPercent===null,
 'Fake physical measurements or hardware acceptance');
req(s.physicalValidation==='none'&&s.physicalVerdict==='unknown'&&
 s.realWorldBuildSuccessPercent===null,
 'Unmeasured target promoted to physical pass');
console.log('PH42 STRICT PASS: original planning source hashes and zero actual hardware observations; no real-world success asserted');