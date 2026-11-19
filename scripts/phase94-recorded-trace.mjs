// Public upstream oscilloscope capture regression. Original bytes are fetched
// at immutable Git revision and Git blob object identity is verified; this
// does NOT independently authenticate source instrument or custody.
import {createHash} from 'node:crypto';
import {parseTektronixCSV} from '../js/hardware/phase94-instrument-ingest.js';
export const UPSTREAM_COMMIT='3813bcfd719b17c1be3ffb757bf51d6aabdd3aef';
export const ORIGINAL_GIT_BLOB='df7f279887877e7405dbb91267f42e5315e0f213';
export const UPSTREAM_URI='https://raw.githubusercontent.com/admk/Tektronix-Waveform-Converter/'+
 UPSTREAM_COMMIT+'/Test%20Samples/TEK0001.CSV';
const r=await fetch(UPSTREAM_URI,{signal:AbortSignal.timeout(25000),redirect:'error'});
if(!r.ok)throw Error('Recorded public Tektronix source unavailable '+r.status);
const bytes=new Uint8Array(await r.arrayBuffer());
if(bytes.length!==79086)throw Error('Public source bytes changed');
const hash=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
if(hash!==ORIGINAL_GIT_BLOB)throw Error('Public source Git object digest mismatch');
const trace=parseTektronixCSV(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
if(trace.values.length!==2500||trace.modelClaim!=='TDS2012C'||
   trace.serialClaim!=='C011240'||trace.originalCaptureAuthenticated!==false)
 throw Error('Original recorded Tektronix capture format/claims mismatch');
process.stdout.write(JSON.stringify({format:'invention-lab/phase94-recorded-public-source-audit/1',
 sampleCount:trace.values.length,modelClaim:trace.modelClaim,
 serialClaim:trace.serialClaim,
 sourceCommit:UPSTREAM_COMMIT,
 originalGitBlobSha1:hash,sha256:createHash('sha256').update(bytes).digest('hex'),
 sourceUpstreamUri:UPSTREAM_URI,
 provenance:'PUBLIC_VENDOR_FORMAT_CAPTURE_NOT_INDEPENDENTLY_AUTHENTICATED',
 instrumentPhysicallyConnectedToRunner:false,
 physicallyQualified:false},null,2)+'\n');
