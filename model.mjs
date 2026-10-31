import { MODEL } from './model-data.mjs';
export { MODEL };
import { FROZEN } from './frozen-parameters.mjs';
import { probability } from './reference_prediction.mjs';

export function validate(age, surgery) {
  if (!['number','string'].includes(typeof age) || (typeof age === 'string' && age.trim()==='') || !Number.isInteger(Number(age)) || Number(age) < MODEL.ageRange[0] || Number(age) > MODEL.ageRange[1]) {
    throw new RangeError('age');
  }
  if (!['number','string'].includes(typeof surgery) || !Object.prototype.hasOwnProperty.call(MODEL.surgeryOffsets, String(surgery))) throw new RangeError('surgery');
  return { age: Number(age), surgery: String(surgery) };
}
function sigmoid(z) { return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)); }
function rawProbability(age, surgery) { return probability({Age:age,SURGERY:surgery},FROZEN.primary); }
export function predict(age, surgery) { const x = validate(age, surgery); return rawProbability(x.age, x.surgery); }

/** Exact two-group interventional Shapley values on the probability scale.
 * v(empty) uses the original joint background's frozen mean; singleton games
 * need only background marginals. No patient rows or outcomes are shipped.
 */
export function explain(age, surgery) {
  const x = validate(age, surgery);
  const { baseline, n, ageCounts, surgeryCounts } = MODEL.background;
  const p = rawProbability(x.age, x.surgery);
  const vAge = surgeryCounts.reduce((s, [c, count]) => s + count * rawProbability(x.age, c), 0) / n;
  const vSurgery = ageCounts.reduce((s, [a, count]) => s + count * rawProbability(a, x.surgery), 0) / n;
  return { probability: p, baseline, age: .5 * (vAge - baseline + p - vSurgery), surgery: .5 * (vSurgery - baseline + p - vAge) };
}
