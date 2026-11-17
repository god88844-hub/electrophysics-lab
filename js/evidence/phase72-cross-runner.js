// Bound a cross-runner archive smoke-test result to source-level evidence only.
export const FORMAT='invention-lab/phase72-cross-runner-source-acceptance/1';
export function assessCrossRunnerResult(x){
 if(!x||typeof x!=='object'||x.appEntrypointsPresent!==true||
  x.extractedNodeESMImportVerified!==true||x.isolatedLoopbackHttpSmoke!==true||
  x.httpCasesVerified!==10||!Number.isInteger(x.verifiedFiles)||x.verifiedFiles<20||
  typeof x.archiveSHA256!=='string'||!/^[a-f0-9]{64}$/.test(x.archiveSHA256)||
  x.productionQualified!==false||x.physicalValidation!=='none')
  throw Error('Cross-runner archive does not satisfy bounded source acceptance');
 return {format:FORMAT,archiveSHA256:x.archiveSHA256,verifiedFiles:x.verifiedFiles,
  httpChecks:x.httpCasesVerified,extractedSourceSmokePassed:true,
  testScope:'GITHUB_ACTIONS_RUNNER_ONLY',
  independentHumanUserAcceptance:'NOT_PERFORMED',
  independentCleanMachineAcceptance:false,signedNativeInstaller:false,
  physicalValidation:'none',physicalVerdict:'unknown',realWorldBuildSuccessPercent:null};
}
