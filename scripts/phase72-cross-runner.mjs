import {verifyPackage} from '../js/release/phase69-package.js';
import {assessCrossRunnerResult} from '../js/evidence/phase72-cross-runner.js';
const report=assessCrossRunnerResult(await verifyPackage('benchmarks/evidence/phase69'));
console.log('PH72 CROSS-RUNNER SOURCE SMOKE PASS:',process.platform,process.arch,process.version,JSON.stringify(report));
