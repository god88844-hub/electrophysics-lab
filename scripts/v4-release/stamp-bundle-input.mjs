import { utimesSync } from 'node:fs';
import { join } from 'node:path';

const { CARGO_TARGET_DIR, SOURCE_DATE_EPOCH } = process.env;
if (!CARGO_TARGET_DIR || !/^\d+$/.test(SOURCE_DATE_EPOCH ?? '')) {
  throw Error('Release bundling requires CARGO_TARGET_DIR and SOURCE_DATE_EPOCH');
}
const stamp = Number(SOURCE_DATE_EPOCH);
utimesSync(join(CARGO_TARGET_DIR, 'release', 'electrophysics-lab.exe'), stamp, stamp);
