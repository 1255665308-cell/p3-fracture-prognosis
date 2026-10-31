import { MODEL16 } from './model16-data.mjs';
export { MODEL16 };
import { FROZEN } from './frozen-parameters.mjs';
import { probability } from './reference_prediction.mjs';
const binaries = ['Gender','hypertension','tumor','2Solidtumor','VD1','rx_CCB_index','rx_loop_diuretic_index','rx_beta_blocker_index','rx_other_antihypertensive_index','rx_thiazide_index'];
const procedures = [...Array.from({length:12},(_,i)=>String(i+1)),'0','unknown'];
export function validate16(source) {
  const result = {};
  for (const f of MODEL16.fields) {
    const value = source?.[f];
    if ((typeof value === 'string' && value.trim() === '') || value === null || value === undefined || (typeof value !== 'string' && typeof value !== 'number')) throw new RangeError(f);
    if (f === 'ASA' || f === 'SURGERY') {
      const allowed = f === 'ASA' ? ['1','2','3','4','unknown'] : procedures;
      if (!allowed.includes(String(value))) throw new RangeError(f);
      result[f] = String(value);
    } else {
      const v = Number(value);
      if (!Number.isFinite(v)) throw new RangeError(f);
      if (binaries.includes(f) && !['0','1'].includes(String(value))) throw new RangeError(f);
      if (f === 'Age' && (!Number.isInteger(v) || v < 50 || v > 105)) throw new RangeError(f);
      const range = MODEL16.sourceRanges[f];
      if (range && (v < range[0] || v > range[1])) throw new RangeError(f);
      result[f] = v;
    }
  }
  return result;
}
export function predict16(source) {
  const inputs = validate16(source);
  const memberProbabilities = FROZEN.comparator.members.map(member => probability(inputs, {...FROZEN.comparator,members:[member]}));
  return {inputs,probability:memberProbabilities.reduce((a,b)=>a+b,0)/memberProbabilities.length,memberProbabilities};
}
