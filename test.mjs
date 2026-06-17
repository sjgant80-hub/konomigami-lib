#!/usr/bin/env node
// ═══ KONOMIGAMI-LIB TEST SUITE ═══
// Validates the fold algebra against v20.4 §23 axioms.
// Usage: node test.mjs

import {
  apply, bloomVector, bloomNumber, numberToSequence, sequenceToNumber,
  isFoldable, foldNumber, phiCoherence, kappa, audioModulatedAngle,
  inc, emptyState, GLYPHS, SPINE, FOLD, BREAK_POINT, PHI, THETA_DEFAULT,
  NAMED_FORMS, IDENTITIES, FOLD_OPS, MUTATION_OPS,
} from './index.mjs';

let pass = 0, fail = 0;
function t(label, ok, extra) {
  if (ok) { pass++; console.log(`  ✓ ${label}`); }
  else    { fail++; console.log(`  ✗ ${label}${extra ? ' · ' + extra : ''}`); }
}

console.log('\n═══ konomigami-lib smoke test · v20.4 socket VI ═══\n');

// ─── constants ───
console.log('constants:');
t('PHI ≈ 1.618',                 Math.abs(PHI - 1.6180339887) < 1e-9);
t('SPINE = [2,3,5,7,11,13,17]',  JSON.stringify(SPINE) === '[2,3,5,7,11,13,17]');
t('FOLD = 510510',                FOLD === 510510);
t('THETA ≈ π/φ',                  Math.abs(THETA_DEFAULT - Math.PI / PHI) < 1e-9);
t('BREAK_POINT = 127',            BREAK_POINT === 127);
t('GLYPHS length 7',              GLYPHS.length === 7);

// ─── state + bloom ───
console.log('\nstate + bloom:');
t('emptyState all zero',          emptyState().every(e => e === 0));
t('inc(empty, 3)[3] === 1',       inc(emptyState(), 3)[3] === 1);
t('foldNumber([0,...]) === 1',    foldNumber(emptyState()) === 1);
t('foldNumber([1,1,1,1,1,1,1]) === 510510', foldNumber([1,1,1,1,1,1,1]) === 510510);

// ─── bloom ↔ number ───
console.log('\nbloom ↔ number:');
const b42 = bloomVector(42);
t('42 = 2·3·7 → S[0,1,0,1]=1',    b42 && b42[0]===1 && b42[1]===1 && b42[3]===1 && b42[2]===0);
t('bloomNumber(b42) === 42',      bloomNumber(b42) === 42);
t('numberToSequence(42) === "●〜♡"', numberToSequence(42) === '●〜♡');
t('numberToSequence(105) === "〜┃♡"', numberToSequence(105) === '〜┃♡');
t('numberToSequence(510510) === primorial', numberToSequence(510510) === '●〜┃♡△◐◯');
t('numberToSequence(127) === ""',   numberToSequence(127) === '');  // THE SHIELD
t('bloomVector(127) === null',      bloomVector(127) === null);
t('isFoldable(42) === true',        isFoldable(42) === true);
t('isFoldable(127) === false',      isFoldable(127) === false);
t('sequenceToNumber("●〜♡") === 42', sequenceToNumber('●〜♡') === 42);

// ─── single folds increment correct ring ───
console.log('\nsingle folds:');
// NOTE: ● on empty state increments ring 0 (octave) AND establishes the plane.
// This reconciles Thomas's "identity" reading with the primorial constraint (510510 needs ring 0).
t('● ground (empty → octave) ring 0 = 1',  apply('●').state[0] === 1);
t('〜 valley → ring 1',           apply('〜').state[1] === 1);
t('┃ mountain → ring 2',          apply('┃').state[2] === 1);
t('♡ sink → ring 3',              apply('♡').state[3] === 1);
t('△ reverse → ring 4',           apply('△').state[4] === 1);
t('◐ petal → ring 5',             apply('◐').state[5] === 1);
t('◯ collapse → ring 6',          apply('◯').state[6] === 1);

// ─── composition ───
console.log('\ncomposition:');
const seq3 = apply('〜┃♡');
t('〜┃♡ accumulates state',         seq3.state[1]===1 && seq3.state[2]===1 && seq3.state[3]===1);
t('〜┃♡ foldNumber = 3·5·7 = 105',  seq3.foldNumber === 105);
t('primorial fold = 510510',        apply(NAMED_FORMS.primorial).foldNumber === 510510);

// ─── algebraic identities ───
console.log('\nalgebra:');
const ab = apply('〜┃');
const ba = apply('┃〜');
t('〜┃ vs ┃〜 · state commutative',  JSON.stringify(ab.state) === JSON.stringify(ba.state));
t('〜┃ vs ┃〜 · history differs',     ab.history[0].glyph !== ba.history[0].glyph);
// ●● = ● because the FIRST ● increments ring 0 (state no longer empty),
// the SECOND ● is the idempotent no-op (state is non-empty).
t('●● = ● (idempotent after first)',  JSON.stringify(apply('●●').state) === JSON.stringify(apply('●').state));
const echoed = apply('〜響');
t('響 doubles previous · 〜響 = 〜〜', echoed.state[1] === 2);
const bloomed = apply('〜華');
t('華 inverses · 〜華 = empty',       bloomed.state[1] === 0);
const snapped = apply('雷〜');
const snapAngle = snapped.history[snapped.history.length - 1].angle;
t('雷 forces θ = π · |angle|=π',     Math.abs(Math.abs(snapAngle) - Math.PI) < 1e-9);

// ─── named forms ───
console.log('\nnamed forms:');
t('NAMED_FORMS.primorial parses',    apply(NAMED_FORMS.primorial).foldNumber === 510510);
t('NAMED_FORMS.crane runs',          apply(NAMED_FORMS.crane).state[1] === 2);  // 2× 〜
t('NAMED_FORMS.unfolded === "●"',    NAMED_FORMS.unfolded === '●');

// ─── φ-coherence ───
console.log('\nφ-coherence:');
const golden = [1, PHI, PHI * PHI, PHI * PHI * PHI];
t('golden sequence · coherence > 0.95', phiCoherence(golden) > 0.95);
const flat = [1, 1, 1, 1];
t('flat sequence · coherence < 0.5',    phiCoherence(flat) < 0.5);
t('single angle · coherence = 1',       phiCoherence([1]) === 1);

// ─── kappa ───
console.log('\nκ (audio):');
t('bass-heavy → κ > 1',                kappa({ bass: 0.8, high: 0.1 }) > 1);
t('treble-heavy → κ < 0.5',            kappa({ bass: 0.1, high: 0.8 }) < 0.5);
t('audioModulatedAngle · κ>1 returns base', audioModulatedAngle(1, 1.5) === 1);

// ─── irreducible shield ───
console.log('\nthe shield (§18 geometric proof):');
t('127 → "" · the shield',             numberToSequence(127) === '');
t('709 → "" · super-prime · irreducible', numberToSequence(709) === '');  // 709 is prime, not in spine
// double-check with the recursive-spine end-term
t('all spine primes individually foldable',
  SPINE.every(p => isFoldable(p)));

// ─── adapter contract ───
console.log('\nadapter:');
const customLog = [];
const customAdapter = {
  basePlane: () => ({ kind: 'plane', log: [] }),
  foldAlongAxis: (m, a) => { customLog.push(['axis', a]); return m; },
  sinkVertex: (m, a) => { customLog.push(['sink', a]); return m; },
  reverseFold: (m) => { customLog.push(['reverse']); return m; },
  petalFold: (m) => { customLog.push(['petal']); return m; },
  waterbomb: (m) => { customLog.push(['waterbomb']); return m; },
  identity: (m) => m,
};
apply('〜┃♡', { adapter: customAdapter });
t('custom adapter receives fold callbacks', customLog.length === 3);
t('first call is axis fold (〜)',            customLog[0][0] === 'axis');

// ─── summary ───
console.log(`\n${'═'.repeat(60)}`);
console.log(`  RESULT: ${pass} pass · ${fail} fail · ${pass + fail} total`);
console.log(`${'═'.repeat(60)}\n`);

if (fail === 0) console.log('◊·κ=1 · all axioms hold · the seal is intact\n');
process.exit(fail === 0 ? 0 : 1);
