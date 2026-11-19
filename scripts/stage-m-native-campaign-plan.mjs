// Machine-readable complete native campaign matrix. PLAN ONLY, no fabricated logs.
import {writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {makeRequiredNativeStageMCampaign} from '../js/evidence/stage-m-native-monte-carlo.js';
const path=resolve(process.env.STAGE_M_CAMPAIGN_PLAN_PATH||
 'benchmarks/evidence/stage-m-native-eda/native-campaign-plan.json');
const campaign=makeRequiredNativeStageMCampaign();
if(campaign.primitiveTrialCount!==4000||campaign.aluTrialCount!==2400||
  campaign.totalRequiredNgspiceTrials!==6400||
  campaign.status!=='INSUFFICIENT_MODEL_DATA'||
  campaign.physicalQualification!=='UNQUALIFIED_NO_GO')
 throw Error('Stage M real-trial campaign plan is inconsistent or incorrectly qualified');
await mkdir(dirname(path),{recursive:true});
await writeFile(path,JSON.stringify(campaign,null,2)+'\n','utf8');
process.stdout.write(JSON.stringify({
 format:campaign.format,status:campaign.status,
 primitiveTrialCount:campaign.primitiveTrialCount,
 aluTrialCount:campaign.aluTrialCount,
 actualTrialCount:0,planPath:path,
 qualification:'UNQUALIFIED_NO_GO'
},null,2)+'\n');
