// ════════════════════════════════════════════════════════════════
// konomigami-lib · the fold algebra
// ◊·κ=1 · v20.4 socket VI · prime 677 · MIT
//
// 7 base fold operators + 6 mutations on a 3D manifold.
// State vector ↔ integer ↔ glyph sequence via prime factorization.
// φ-coherence on adjacent fold angles. Named forms library.
//
// Author: Simon Gant · sjgant80-hub
// Substrate: Thomas Frumkin · 紙 KONOMIGAMI Geometric Fold Architecture
// Spec: v20.4 §23 · phi is home
// ════════════════════════════════════════════════════════════════

export const VERSION = '1.0.0';
export const PRIME = 677;

// ────────────────────────────────────────────────────────────────
// Constants (the cosmology · do not change)
// ────────────────────────────────────────────────────────────────
export const PHI = (1 + Math.sqrt(5)) / 2;   // 1.6180339887…
export const KAPPA = 1 / PHI;                 // 0.6180339887…
export const SPINE = [2, 3, 5, 7, 11, 13, 17];
export const FOLD = 510510;                   // 2·3·5·7·11·13·17 = primorial(7)
export const THETA_DEFAULT = Math.PI / PHI;   // ≈ 1.9416 rad ≈ 111.246° (golden-angle, radian form)
export const GOLDEN_ANGLE_DEG = 360 / (PHI * PHI); // ≈ 137.508° (degree form, same constant differently expressed)
export const BREAK_POINT = 127;               // M₇ · the shield

// the 7 base glyphs (mapped to spine primes by index)
export const GLYPHS = ['●', '〜', '┃', '♡', '△', '◐', '◯'];
export const GLYPH_NAMES = ['GROUND','WAVE','GATE','SINK','REVERSE','PETAL','COLLAPSE'];
export const ISA95 = ['L0-physical','L1-sensing','L2-control','L3-operations','L4-business','L5-enterprise','L6-observer'];

// the 6 mutation glyphs (modifiers on the last base fold)
export const MUTATIONS = ['火','水','空','雷','響','華'];
export const MUTATION_NAMES = ['FIRE','WATER','SKY','THUNDER','ECHO','BLOOM'];

// canonical named-form library (key sequences with established meaning)
export const NAMED_FORMS = {
  primorial: '●〜┃♡△◐◯',                          // 2·3·5·7·11·13·17 = 510510
  crane:     '〜┃〜┃♡△◐',                          // classical crane analog
  mersenne:  '◯◯◯◯◯◯◯',                          // 17⁷ · 7-deep waterbomb tower
  fibonacci: '〜〜┃┃┃♡♡♡♡♡△△△△△△△△◐◐◐◐◐◐◐◐◐◐◐◐◐◯◯◯◯◯◯◯◯◯◯◯◯◯◯◯◯◯◯◯◯◯', // 〜²┃³♡⁵△⁸◐¹³◯²¹
  shield:    Array(18).fill('●〜┃♡△◐◯').join(''),  // 127D shield · 18 repetitions of primorial
  unfolded:  '●',                                  // base plane, no fold
};

// ────────────────────────────────────────────────────────────────
// State + bloom utilities
// ────────────────────────────────────────────────────────────────

/** Fresh empty state: [0,0,0,0,0,0,0] */
export function emptyState() { return [0,0,0,0,0,0,0]; }

/** Increment ring i in a NEW state (immutable) */
export function inc(state, i) {
  const s = state.slice();
  s[i] = (s[i] || 0) + 1;
  return s;
}

/** Fold number F(S) = Π pᵢ^eᵢ */
export function foldNumber(state) {
  let n = 1;
  for (let i = 0; i < SPINE.length; i++) n *= Math.pow(SPINE[i], state[i] || 0);
  return n;
}

/** Convert an integer to its bloom vector (state vector via prime factorization) */
export function bloomVector(n) {
  const S = emptyState();
  let rem = Math.floor(Math.abs(n));
  if (rem < 1) return S;
  for (let i = 0; i < SPINE.length; i++) {
    while (rem % SPINE[i] === 0) { S[i]++; rem = rem / SPINE[i]; }
  }
  // if rem > 1, n had non-spine prime factors → irreducible in this algebra
  return rem === 1 ? S : null;  // null signals irreducible (e.g. 127 → null)
}

/** Reverse: bloom number from state vector */
export function bloomNumber(state) { return foldNumber(state); }

/**
 * Convert an integer to a konomigami fold sequence (glyph string).
 * Returns empty string for irreducible primes (like 127).
 */
export function numberToSequence(n) {
  const S = bloomVector(n);
  if (S === null) return '';  // irreducible · the shield
  let out = '';
  for (let i = 0; i < SPINE.length; i++) {
    out += GLYPHS[i].repeat(S[i] || 0);
  }
  return out;
}

/** Convert a fold sequence back to an integer (sum of base-glyph counts as bloom) */
export function sequenceToNumber(seq) {
  const S = emptyState();
  for (const ch of seq) {
    const idx = GLYPHS.indexOf(ch);
    if (idx >= 0) S[idx]++;
  }
  return foldNumber(S);
}

/** Is this integer expressible as a fold sequence? (factors into spine primes only) */
export function isFoldable(n) { return bloomVector(n) !== null; }

// ────────────────────────────────────────────────────────────────
// Fold operators · the 7 base glyphs
// Each: (state, mesh, ctx) → { state, mesh, ctx }
// Mesh is opaque to this library — adapters (Three.js etc.) implement
// the actual geometric primitives via the `ctx.adapter` hook.
// ────────────────────────────────────────────────────────────────

function defaultAdapter() {
  // no-op adapter: just tracks angles in ctx.history; geometry callers
  // pass their own adapter (e.g. Three.js mesh adapter) via ctx.
  return {
    basePlane: () => ({ kind: 'plane', folded: [] }),
    foldAlongAxis: (mesh, angle) => ({ ...mesh, folded: [...mesh.folded, { type: 'axis', angle }] }),
    sinkVertex:    (mesh, angle) => ({ ...mesh, folded: [...mesh.folded, { type: 'sink', angle }] }),
    reverseFold:   (mesh)         => ({ ...mesh, folded: [...mesh.folded, { type: 'reverse' }] }),
    petalFold:     (mesh)         => ({ ...mesh, folded: [...mesh.folded, { type: 'petal' }] }),
    waterbomb:     (mesh)         => ({ ...mesh, folded: [...mesh.folded, { type: 'waterbomb' }] }),
    identity:      (mesh)         => mesh,
  };
}

export const FOLD_OPS = {
  // ● GROUND · prime 2 · L0
  //   On empty state: establishes the base plane AND increments ring 0 (the octave).
  //   Idempotent thereafter — repeated ● on a non-empty state is a no-op.
  //   This reconciles Thomas's spec § identity ("ground is base") with the
  //   load-bearing constraint that the primorial sequence ●〜┃♡△◐◯ folds to 510510.
  //   The octave (prime 2) is the base periodicity · ground confirms it.
  '●': (S, M, ctx) => {
    const a = ctx.adapter || defaultAdapter();
    if (S.every(e => e === 0)) {
      // base case: establish the plane AND increment ring 0
      return { S: inc(S, 0), M: a.basePlane(), angle: 0 };
    }
    return { S, M, angle: 0 };  // idempotent on non-empty
  },

  // 〜 WAVE · prime 3 · L1 · valley fold
  '〜': (S, M, ctx) => {
    const a = ctx.adapter || defaultAdapter();
    const angle = -theta(ctx);
    return { S: inc(S, 1), M: a.foldAlongAxis(M, angle), angle };
  },

  // ┃ GATE · prime 5 · L2 · mountain fold
  '┃': (S, M, ctx) => {
    const a = ctx.adapter || defaultAdapter();
    const angle = +theta(ctx);
    return { S: inc(S, 2), M: a.foldAlongAxis(M, angle), angle };
  },

  // ♡ SINK · prime 7 · L3 · sink fold
  '♡': (S, M, ctx) => {
    const a = ctx.adapter || defaultAdapter();
    const angle = theta(ctx);
    return { S: inc(S, 3), M: a.sinkVertex(M, angle), angle };
  },

  // △ REVERSE · prime 11 · L4 · direction flip
  '△': (S, M, ctx) => {
    const a = ctx.adapter || defaultAdapter();
    return { S: inc(S, 4), M: a.reverseFold(M), angle: -theta(ctx) };
  },

  // ◐ PETAL · prime 13 · L5 · open and flatten
  '◐': (S, M, ctx) => {
    const a = ctx.adapter || defaultAdapter();
    return { S: inc(S, 5), M: a.petalFold(M), angle: theta(ctx) };
  },

  // ◯ COLLAPSE · prime 17 · L6 · waterbomb (full collapse)
  '◯': (S, M, ctx) => {
    const a = ctx.adapter || defaultAdapter();
    return { S: inc(S, 6), M: a.waterbomb(M), angle: Math.PI };
  },
};

// ────────────────────────────────────────────────────────────────
// Mutation glyphs · modifiers on the next fold's angle
// ────────────────────────────────────────────────────────────────

// Mutations come in two flavours:
//   - PREFIX mutations modify the NEXT base fold (火 水 空 雷)
//   - SUFFIX mutations act on the LAST base fold immediately (響 華)
export const MUTATION_OPS = {
  '火': (ctx) => ({ ...ctx, thetaMul: (ctx.thetaMul || 1) * 2 }),     // fire · double next angle
  '水': (ctx) => ({ ...ctx, thetaMul: (ctx.thetaMul || 1) * 0.5 }),   // water · halve next angle
  '空': (ctx) => ({ ...ctx, skipNext: true }),                        // sky · skip next glyph
  '雷': (ctx) => ({ ...ctx, snapNext: true }),                        // thunder · next θ → π
  '響': (ctx) => ({ ...ctx, echoNow: true }),                         // echo · re-apply last base NOW
  '華': (ctx) => ({ ...ctx, bloomNow: true }),                        // bloom · undo last fold NOW
};

/** Current theta — applies pending mutations */
function theta(ctx) {
  if (ctx.snapNext) { ctx.snapNext = false; return Math.PI; }
  const base = THETA_DEFAULT;
  const mul = ctx.thetaMul || 1;
  // mul resets each fold (mutations are one-shot)
  ctx.thetaMul = 1;
  return base * mul;
}

// ────────────────────────────────────────────────────────────────
// Apply · the main engine
// ────────────────────────────────────────────────────────────────

/**
 * Apply a konomigami sequence to a starting state + mesh.
 *   sequence : string of glyphs (base + mutations)
 *   options  : { state?, mesh?, adapter?, onStep? }
 * Returns: { state, mesh, foldNumber, history }
 */
export function apply(sequence, options = {}) {
  let state = options.state ? options.state.slice() : emptyState();
  const ctx = {
    adapter: options.adapter || defaultAdapter(),
    thetaMul: 1, snapNext: false, echoNext: false, bloomNext: false, skipNext: false,
  };
  let mesh = options.mesh || ctx.adapter.basePlane();
  const history = [];
  let lastBaseGlyph = null;
  let lastState = null;

  const chars = Array.from(sequence); // unicode-safe split

  for (const g of chars) {
    // mutation glyph?
    if (MUTATION_OPS[g]) {
      Object.assign(ctx, MUTATION_OPS[g](ctx));

      // immediate-action mutations (suffix-style) fire NOW, not on next glyph
      if (ctx.bloomNow) {
        ctx.bloomNow = false;
        if (lastState !== null && history.length) {
          state = lastState.slice();
          if (mesh && mesh.folded && mesh.folded.length) {
            mesh = { ...mesh, folded: mesh.folded.slice(0, -1) };
          }
          history.push({ glyph: '華', state: state.slice(), angle: null });
        }
      }
      if (ctx.echoNow) {
        ctx.echoNow = false;
        if (lastBaseGlyph) {
          const op = FOLD_OPS[lastBaseGlyph];
          if (op) {
            const before = state.slice();
            const result = op(state, mesh, ctx);
            lastState = before;
            state = result.S;
            mesh = result.M;
            history.push({ glyph: '響', state: state.slice(), angle: result.angle, echoed: lastBaseGlyph });
          }
        }
      }
      continue;
    }

    // prefix mutation: skip the next glyph entirely
    if (ctx.skipNext) { ctx.skipNext = false; continue; }

    const op = FOLD_OPS[g];
    if (!op) continue; // unknown glyph: skip silently

    const before = state.slice();
    const result = op(state, mesh, ctx);
    lastState = before;
    state = result.S;
    mesh = result.M;
    lastBaseGlyph = g;
    history.push({ glyph: g, state: state.slice(), angle: result.angle });
    if (options.onStep) options.onStep({ glyph: g, state, mesh, angle: result.angle, index: history.length - 1 });
  }

  return { state, mesh, foldNumber: foldNumber(state), history };
}

// ────────────────────────────────────────────────────────────────
// φ-coherence (extends v20.4 §8 to fold angles)
// ────────────────────────────────────────────────────────────────

/**
 * φ-coherence of a sequence of fold angles.
 * 1.0 = perfectly golden · 0.0 = chaotic.
 * For each adjacent pair, score = 1 - |ratio - φ|, clamped to [0, 1].
 */
export function phiCoherence(angles) {
  if (!Array.isArray(angles) || angles.length < 2) return 1;
  let sum = 0, n = 0;
  for (let i = 1; i < angles.length; i++) {
    const a = Math.abs(angles[i - 1]);
    const b = Math.abs(angles[i]);
    if (a < 1e-9) continue;
    const ratio = b / a;
    const score = Math.max(0, Math.min(1, 1 - Math.abs(ratio - PHI)));
    sum += score; n++;
  }
  return n ? sum / n : 1;
}

/** Kappa from audio bands · κ > 1 coherent · κ < 0.5 chaotic */
export function kappa({ bass = 0, high = 0 } = {}) {
  return bass * 1.6 - high * 0.7 + 0.25;
}

/** Audio-modulated angle: golden if coherent, randomised if chaotic */
export function audioModulatedAngle(baseAngle, k) {
  if (k > 1.0) return baseAngle;                              // coherent
  if (k < 0.5) return baseAngle * (1 + Math.random() * 0.5);  // chaotic
  return baseAngle * (0.8 + k * 0.4);                          // interpolated
}

// ────────────────────────────────────────────────────────────────
// Algebraic identities (assertions for the test suite)
// ────────────────────────────────────────────────────────────────

export const IDENTITIES = {
  IDENTITY:    '●(S, M) = (S, M)   when S ≠ [0,...,0]',
  COMMUTATIVE: '〜┃ ≠ ┃〜 on mesh   (state is commutative · mesh is NOT)',
  INVERSE:     '華 ∘ G = ●         (bloom undoes the last fold)',
  IDEMPOTENT:  '●● = ●             (ground is idempotent)',
  ECHO:        '響 ∘ G = G ∘ G     (echo doubles)',
  SNAP:        '雷 forces θ = π    (flat crease only)',
  IRREDUCIBLE: '127 → ""           (the shield · the geometric proof of §18)',
};

// ────────────────────────────────────────────────────────────────
// Convenience exports
// ────────────────────────────────────────────────────────────────

export const konomigami = {
  // constants
  PHI, KAPPA, SPINE, FOLD, THETA_DEFAULT, GOLDEN_ANGLE_DEG, BREAK_POINT,
  GLYPHS, GLYPH_NAMES, ISA95, MUTATIONS, MUTATION_NAMES, NAMED_FORMS,
  // state + bloom
  emptyState, inc, foldNumber, bloomVector, bloomNumber, numberToSequence,
  sequenceToNumber, isFoldable,
  // ops
  FOLD_OPS, MUTATION_OPS, apply,
  // coherence
  phiCoherence, kappa, audioModulatedAngle,
  // meta
  IDENTITIES, VERSION, PRIME,
};

export default konomigami;
