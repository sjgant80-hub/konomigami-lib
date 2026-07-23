# CLAUDE.md · konomigami-lib

Instructions for any agent working in this repository.

## What this is

A pure, deterministic, zero-dependency ES module implementing the **fold algebra**: a bijection between
a 7-dimensional non-negative-integer state and the integers, by prime factorization over the spine
`[2,3,5,7,11,13,17]`. See `SPEC.md` for the full design; read it before changing anything.

## Invariants you must preserve

1. **Determinism** — no `Date`, no `Math.random`, no I/O, no network. Same input → same output, always.
2. **Immutability** — never mutate an argument; copy on write (`inc` is the pattern).
3. **The round-trip** — `bloomVector(foldNumber(S)) === S` and `foldNumber(bloomVector(n)) === n` for
   spine-smooth `n`. Any change must keep `test.mjs` green.
4. **Zero dependencies** — do not add a package to `dependencies`. The standard library only.
5. **Frozen constants** — `PHI`, `KAPPA`, `SPINE`, `FOLD` (510510), `BREAK_POINT` (127) are fixed by the
   substrate. Changing one is a **major** `VERSION` bump and a `SPEC.md` spec-version bump.

## How to run

```
node test.mjs
```

CI (`.github/workflows/ci.yml`) runs the same on every push. A change that reddens CI does not ship.

## Seam

This repo is the **mathematics** only. Do not add interpretation, cosmology, or narrative that assigns
meaning beyond the algebra — the library must stand complete on its own terms and depend on nothing
outside the standard library.
