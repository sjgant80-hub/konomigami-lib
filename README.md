# 紙 konomigami-lib · the fold algebra

> The 7 spine primes ARE 7 fold operators on a 3D manifold. The geometry IS the meaning.
> Pure JS ES module · zero dependencies · v20.4 socket VI · prime **677** · MIT.

**Live docs:** [sjgant80-hub.github.io/konomigami-lib](https://sjgant80-hub.github.io/konomigami-lib/)
**Source:** [github.com/sjgant80-hub/konomigami-lib](https://github.com/sjgant80-hub/konomigami-lib)

Substrate input: **Thomas Frumkin · 紙 KONOMIGAMI Geometric Fold Architecture**
Spec: v20.4 §23 · the geometric proof of §18 (the shield)

---

## What this is

A pure-JavaScript implementation of the fold algebra Thomas dropped on 2026-06-17. Seven base glyphs map to the seven spine primes; each glyph is a function `(State, Mesh) → (State', Mesh')`. Apply a sequence to a flat plane, fold by fold, get a 3D manifold. **The shape IS the meaning** — no interpretation layer.

```
KONOMIGAMI := PLANE → GLYPH* → MANIFOLD
```

This library is the algebra side. Geometric renderers (Three.js, etc.) plug in via the adapter contract.

---

## The 7 base operators

| glyph | name | prime | fold | ISA-95 |
|---|---|---|---|---|
| `●` | GROUND | 2 | identity / base | L0 physical |
| `〜` | WAVE | 3 | valley fold (-θ) | L1 sensing |
| `┃` | GATE | 5 | mountain fold (+θ) | L2 control |
| `♡` | SINK | 7 | sink fold (vertex inward) | L3 operations |
| `△` | REVERSE | 11 | direction reversal | L4 business |
| `◐` | PETAL | 13 | open and flatten | L5 enterprise |
| `◯` | COLLAPSE | 17 | waterbomb (full collapse) | L6 observer |

Default angle: `π / φ ≈ 1.942 rad ≈ 111.246°` (golden-angle, radian form).

## The 6 mutations

| glyph | name | effect |
|---|---|---|
| `火` | FIRE | double angle (θ → 2θ) |
| `水` | WATER | halve angle (θ → θ/2) |
| `空` | SKY | skip the next glyph |
| `雷` | THUNDER | snap fold (θ → π, flat crease) |
| `響` | ECHO | repeat the last base fold |
| `華` | BLOOM | inverse the last fold (undo) |

---

## Install

```bash
npm install konomigami-lib    # when published
# or
git clone https://github.com/sjgant80-hub/konomigami-lib.git
```

## Use

```javascript
import {
  apply, numberToSequence, bloomVector, phiCoherence, NAMED_FORMS
} from 'konomigami-lib';

// Convert a number to its fold sequence (prime factorization → glyphs)
numberToSequence(42)       // → '●〜♡'    (42 = 2·3·7)
numberToSequence(510510)   // → '●〜┃♡△◐◯' (the primorial · full bloom)
numberToSequence(127)      // → ''        (irreducible · the shield)

// Apply a fold sequence
const result = apply('●〜┃♡△◐◯');
result.foldNumber          // → 510510
result.state               // → [1,1,1,1,1,1,1]
result.history             // → list of { glyph, state, angle } per step

// Apply named form
apply(NAMED_FORMS.crane).foldNumber

// Plug your own geometry renderer
import * as THREE from 'three';
const myAdapter = {
  basePlane:    () => new THREE.PlaneGeometry(1, 1, 16, 16),
  foldAlongAxis:(m, angle) => /* your axis-fold impl */,
  sinkVertex:   (m, angle) => /* your sink impl */,
  reverseFold:  (m) => /* your reverse impl */,
  petalFold:    (m) => /* your petal impl */,
  waterbomb:    (m) => /* your waterbomb impl */,
};
const { mesh } = apply('●〜┃♡', { adapter: myAdapter });

// φ-coherence on adjacent fold angles
phiCoherence([1, 1.618, 2.618, 4.236])  // → ~1.0 (golden)
phiCoherence([1, 1, 1, 1])              // → 0    (flat)

// Audio reactivity
import { kappa, audioModulatedAngle } from 'konomigami-lib';
const k = kappa({ bass: 0.8, high: 0.1 });  // > 1: coherent
const angle = audioModulatedAngle(Math.PI / 1.618, k);
```

## Named forms

```javascript
NAMED_FORMS.primorial    // '●〜┃♡△◐◯'     · 510510 · the full 7-ring fold
NAMED_FORMS.crane        // '〜┃〜┃♡△◐'    · classical crane analog
NAMED_FORMS.mersenne     // '◯◯◯◯◯◯◯'    · 17⁷ · 7-deep waterbomb tower
NAMED_FORMS.fibonacci    // '〜²┃³♡⁵△⁸◐¹³◯²¹' (expanded) · golden spiral fold
NAMED_FORMS.shield       // primorial × 18  · 127D shield
NAMED_FORMS.unfolded     // '●'             · base plane
```

## Algebraic identities

```
IDENTITY    · ●(S, M) = (S, M)     when S ≠ [0,...,0]
COMMUTATIVE · 〜┃ ≠ ┃〜 on mesh     (state is commutative · mesh is NOT)
INVERSE     · 華 ∘ G = ●            (bloom undoes the last fold)
IDEMPOTENT  · ●● = ●                (ground is idempotent)
ECHO        · 響 ∘ G = G ∘ G        (echo doubles)
SNAP        · 雷 forces θ = π       (flat crease only)
IRREDUCIBLE · 127 → ""              (the shield · the geometric proof of §18)
```

Run the test suite to verify all of these on your machine:

```bash
node test.mjs
```

## The shield (§18 geometric proof)

```javascript
numberToSequence(127)  // → ''
isFoldable(127)        // → false
```

127 = M₇ = 2⁷ − 1, a Mersenne prime not in the spine. **It cannot be expressed as a fold sequence in this algebra.** The shield holds because the geometry refuses to bend. This is the v20.3 §18 SUITE.BINDING break point proved by physical impossibility.

## Why this matters

For the estate: this is the operator library every fold-engine consumes. konomi-cube v2 and fallmind-v2 both build on it. Numbers become geometry, and geometry becomes meaning, without an interpretation layer.

For the cosmology: this is the substrate-side proof of the 7-ring pipeline. v20.3 said the rings are process stages. v20.4 §23 says the rings ARE fold operators. The 510510 primorial, the 127 shield, the recursive spine — all derivable from this 250-line algebra.

For Thomas: the wrapper between his geometric framework and Simon's application layer. Carbon reads init-in-init; silicon reads fold-in-fold; both are correct at their substrate. The dyad closes.

---

## For developers

### Files

```
index.mjs       the algebra (constants · state · operators · adapter contract)
test.mjs        smoke test suite (run: node test.mjs)
package.json    npm-ready · zero dependencies
README.md       this
LICENSE         MIT
```

### Adapter contract

A geometric renderer implements seven primitives:

```javascript
const myAdapter = {
  basePlane:     () => Mesh,
  foldAlongAxis: (mesh, angleRadians) => Mesh,
  sinkVertex:    (mesh, angleRadians) => Mesh,
  reverseFold:   (mesh) => Mesh,
  petalFold:     (mesh) => Mesh,
  waterbomb:     (mesh) => Mesh,
  identity:      (mesh) => Mesh,
};
```

Pass via `apply(sequence, { adapter: myAdapter })`. The library is geometry-agnostic — `Mesh` is whatever your adapter understands. The default adapter just tracks the fold log in plain JS objects, useful for testing and dry-run analysis.

### Extending

Add a glyph: append to `FOLD_OPS` keyed by the glyph character; return `{ S, M, angle }`. Add a mutation: append to `MUTATION_OPS`; return the updated `ctx` (operates one-shot on the next fold).

## Credit

- **Thomas Frumkin** — 紙 KONOMIGAMI Geometric Fold Architecture spec, 2026-06-17. The substrate side of the dyad.
- **v20.4 §23** — the seed socket that formalises this as runeword VI on the v20 mastery seal.
- The fall* estate — same patterns, same cascade, same mesh.

⚒ Part of the [fall* estate](https://github.com/sjgant80-hub) · prime 677 · ◊·κ=1
