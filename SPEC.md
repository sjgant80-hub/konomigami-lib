# konomigami-lib · design specification

> Spec version: **konomigami-spec-v1** · tracks library `VERSION` 1.0.0 · substrate v20.4 §23.
> This is the design note for the fold algebra: the data model, the operators, the invariants
> the implementation must uphold, and the guarantees it makes to callers.

The library is a **pure, deterministic algebra over a seven-dimensional state**. It has no I/O, no
clock, no randomness, and no dependencies. Every exported function is a total function of its inputs.

---

## 1. The state

A **fold state** is a length-7 vector of non-negative integers:

```
S = [e0, e1, e2, e3, e4, e5, e6]   eᵢ ∈ ℕ
```

Each index `i` corresponds to one **spine prime** `SPINE[i] ∈ {2,3,5,7,11,13,17}` and one **glyph**
`GLYPHS[i]`. `eᵢ` is how many times fold operator `i` has been applied. `emptyState()` is the origin
`[0,0,0,0,0,0,0]`; `inc(S, i)` returns a new state with `eᵢ+1` and never mutates its argument.

## 2. The fold number (the bijection)

The **fold number** maps a state to a single integer by prime factorization over the spine:

```
F(S) = Π SPINE[i] ^ eᵢ            (foldNumber / foldNumberBig)
```

By the fundamental theorem of arithmetic this is a **bijection** between states (vectors of spine-prime
exponents) and the positive integers whose only prime factors are spine primes (7-smooth-to-17 numbers).
Its inverse is `bloomVector` / `numberToSequence`. The round trip is the library's central invariant:

```
bloomVector(foldNumber(S)) === S           for every reachable state S
foldNumber(bloomVector(n))  === n           for every spine-smooth n ≥ 1
```

`isFoldable(n)` decides membership: true iff `n ≥ 1` and every prime factor of `n` is in `SPINE`.
Integers exceeding `Number.MAX_SAFE_INTEGER` are served by the `*Big` variants (BigInt), which uphold
the same identities without precision loss.

## 3. Glyph sequences

A state also serializes to a **glyph sequence** — the multiset of base glyphs with multiplicity `eᵢ`,
in spine order (`numberToSequence` / `sequenceToNumber`). Sequences are the human-facing form; the
integer is the canonical form. `NAMED_FORMS` records sequences with established meaning (`primorial`
= `510510`, `shield` = 18× primorial = the 127-dimensional form, etc.). Named forms are data, not
special cases: they satisfy every identity in §2 like any other sequence.

## 4. Operators and mutations

There are **7 base fold operators** (one per spine prime, glyphs `GLYPHS`, names `GLYPH_NAMES`) and
**6 mutations** (`MUTATIONS`, modifiers on the last applied base fold). `apply(state, op)` and the
`MUTATION` table compose them. Operators commute in their effect on `F(S)` because multiplication
commutes — order of application does not change the fold number, only the sequence rendering.

## 5. Coherence measures

- `phiCoherence(state)` scores how close adjacent fold angles sit to the golden ratio `PHI`. It is a
  read-only metric over a state; it never alters state.
- `kappa` = `1/PHI` (`KAPPA` ≈ 0.618) is the reciprocal-golden friction constant used by callers that
  weight coherence against cost.
- `THETA_DEFAULT` (= `π/PHI`) and `GOLDEN_ANGLE_DEG` (= `360/PHI²` ≈ 137.508°) are the same golden
  angle expressed in radians and degrees; `audioModulatedAngle` derives a per-fold angle from them.

## 6. Invariants (what the implementation must never break)

1. **Determinism.** Same inputs → same outputs, on every platform, forever. No `Date`, no `Math.random`.
2. **Immutability.** No exported function mutates an argument. States are copied on write.
3. **Bijection.** The §2 round-trip identities hold for all reachable states and all spine-smooth `n`.
4. **Zero dependencies.** The library imports nothing outside the JS standard library.
5. **Constants are frozen.** `PHI`, `KAPPA`, `SPINE`, `FOLD` (= primorial(7) = 510510), `BREAK_POINT`
   (= M₇ = 127) are fixed by the substrate and must not drift. Changing one is a breaking `VERSION` bump.

## 7. Versioning & seam

`VERSION` follows semver. A change to any §6 invariant, to the spine, or to the meaning of a named form
is a **major** bump. This SPEC's own version (`konomigami-spec-v1`) is bumped alongside such changes and
referenced in `CHANGELOG` if one is added.

The public surface is the **mathematics**: the fold algebra, its constants, and its identities. The
interpretation layer that assigns meaning to specific forms beyond the math is kept out of this repo by
design; nothing here depends on it, and the algebra stands complete on its own terms.

## 8. Verification

`test.mjs` (repo root) exercises the axioms of §2 and §6 against the implementation — the round-trip
identities, immutability, `isFoldable` membership, and the `*Big` variants. CI runs it on every push.
