// Data-only manufacturer CAD intake: a checksum is not a manufacturer endorsement.
export const MANUFACTURER_CAD_INTAKE_FORMAT='invention-lab/manufacturer-cad-intake/1';
const sha=/^[a-f0-9]{64}$/;
const token=/^[A-Za-z0-9][A-Za-z0-9._+\-]{0,127}$/;
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
function boundedToken(x,label){if(typeof x!=='string'||!token.test(x))throw Error('Invalid '+label);return x;}
function sourceURL(value){
 if(typeof value!=='string'||value.length>2048)throw Error('Invalid manufacturer source URL');
 let url;try{url=new URL(value);}catch{throw Error('Invalid manufacturer source URL');}
 if(url.protocol!=='https:'||url.username||url.password||url.hash||!url.hostname||
  url.hostname==='localhost'||url.hostname.endsWith('.localhost')||
  /^(?:\d{1,3}\.){3}\d{1,3}$/.test(url.hostname)||url.hostname.includes(':'))
  throw Error('Manufacturer source must be public HTTPS hostname');
 return url.href;
}
function dimensions(v){
 if(!plain(v))throw Error('Missing manufacturer bounding dimensions');
 const out={};for(const key of ['widthMm','heightMm','depthMm']){
  if(typeof v[key]!=='number'||!Number.isFinite(v[key])||v[key]<=0||v[key]>300)
   throw Error('Invalid manufacturer '+key);
  out[key]=v[key];
 }
 if(Object.keys(v).length!==3)throw Error('Unexpected manufacturer dimension field');
 return out;
}
export function validateManufacturerCADRecord(record){
 if(!plain(record)||record.format!==MANUFACTURER_CAD_INTAKE_FORMAT)
  throw Error('Unsupported manufacturer CAD intake format');
 const allowed=['format','manufacturer','manufacturerPartNumber','revision','sourceUrl','licenseId',
  'mediaType','sha256','byteLength','boundingBoxMm'];
 if(Object.keys(record).some(k=>!allowed.includes(k))||allowed.some(k=>!(k in record)))
  throw Error('Missing or unknown manufacturer CAD intake field');
 const mediaType=record.mediaType;
 if(!['model/step','application/step','application/octet-stream'].includes(mediaType))
  throw Error('Unsupported manufacturer CAD MIME type');
 if(typeof record.sha256!=='string'||!sha.test(record.sha256))
  throw Error('Invalid SHA256 digest');
 if(!Number.isSafeInteger(record.byteLength)||record.byteLength<=0||record.byteLength>25_000_000)
  throw Error('Invalid CAD size');
 return Object.freeze({format:MANUFACTURER_CAD_INTAKE_FORMAT,
  manufacturer:boundedToken(record.manufacturer,'manufacturer'),
  manufacturerPartNumber:boundedToken(record.manufacturerPartNumber,'part number'),
  revision:boundedToken(record.revision,'revision'),sourceUrl:sourceURL(record.sourceUrl),
  licenseId:boundedToken(record.licenseId,'license ID'),mediaType,
  sha256:record.sha256,byteLength:record.byteLength,
  boundingBoxMm:Object.freeze(dimensions(record.boundingBoxMm))});
}
export async function verifyManufacturerCADBytes(record,bytes){
 const manifest=validateManufacturerCADRecord(record);
 if(!(bytes instanceof Uint8Array)||bytes.byteLength!==manifest.byteLength)
  throw Error('Manufacturer CAD byte length mismatch');
 if(!globalThis.crypto?.subtle)throw Error('SHA256 verification unavailable');
 const digest=new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',bytes));
 const actual=Array.from(digest,x=>x.toString(16).padStart(2,'0')).join('');
 if(actual!==manifest.sha256)throw Error('Manufacturer CAD SHA256 mismatch');
 return Object.freeze({record:manifest,integrity:'sha256-matched',
  sourceAuthenticity:'unverified',licenseReview:'required',
  geometryParsed:false,dimensionsVerified:false,physicalValidation:'none',
  manufacturingQualified:false});
}
