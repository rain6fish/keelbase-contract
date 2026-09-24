# Contributing

This repository is the contract: the wire-object schemas, the language-neutral conformance vectors,
and the single version line they share. The runtimes that consume it — and anyone else who claims
conformance — are consumers. Nothing in here belongs to an implementation.

Read [`README.md`](README.md) first; it states the versioning and change rules in full. This file is
how to carry them out.

## The one rule

**Change the contract here, never in a consuming repository.**

A contract change made in a consuming repository is the first step of a silent fork. The other
consumer keeps reading the old text, and nothing reports the divergence until it has already
happened — usually as a merge that quietly reverts the change. Consuming repositories are expected to
guard against it; this repository is where the change belongs.

## Deciding the version

One question decides it: **would a third party, reproducing from this repository alone, get a
different result?**

| If the change… | …then | Version |
|---|---|---|
| adds files — a new wire object, a new `schemas/vN/` for an existing object, a new vector | no published file changes | **MINOR** |
| corrects something no assertion depends on — a sample value that still validates, descriptive text | no | **PATCH** |
| removes or renames a published file, or changes semantics a published version promised | **yes** | **MAJOR** — needs a decision record, and both consumers move together |

Two constraints make this simpler than it sounds:

- **Additive means alongside, not in place.** To change the shape of an existing object, add
  `schemas/v2/` and leave `v1` exactly where it is. A published file is never rewritten.
- **Two consumers means no unilateral landing.** Any implementation may propose a change; none may
  land one on its own.

### What is not part of the version line

Repository furniture — this file, `LICENSE`, `.gitattributes` — changes nothing a consumer
reproduces. It needs no version bump and no changelog entry. The version line tracks the contract and
the vectors, not the paperwork around them.

## Doing it

1. `git status` first. Never start from a dirty tree.
2. Make the change here. Vectors and schemas that decide the same thing go in **one** commit — the
   contract and the criteria that judge it are not allowed to disagree, not even between commits.
3. Add a [`CHANGELOG.md`](CHANGELOG.md) entry: one version heading, an English block first, then a
   Chinese block.
4. `git tag -a vX.Y.Z -m "<message>"`.
5. Push the branch and the tag.

## What the consumers do next

They move to the new version deliberately. The contract does not reach into them.

- A consumer that binds this repository as a **submodule** advances the pin and commits that. Moving
  the pin changes only the directory entry, not the files inside it — so it is not an edit of the
  contract, and a well-built guard lets it through.
- A consumer that **vendors** a copy must re-sync that copy and re-run its drift check. This is the
  weaker arrangement: nothing fails if the re-sync is forgotten, so it has to be part of the routine
  rather than a thing someone remembers.

## Verification

**The contract checks itself.** CI runs the offline half of the language-neutral runner: every registry
sample is validated against the schema its entry names, against this checkout alone — no runtime, no
implementation, no base URL. `npm ci && npm run check` runs the same thing locally.

That is new, and it replaces an arrangement worth naming: until it existed, a change here was
**unverified until some consumer ran its own suite against it**. The contract's correctness was in the
hands of the parties it is supposed to constrain, and a mistake was visible only from the outside.

The consuming runtimes' suites still matter — they check that an *implementation* reproduces the
contract, which is a different question from whether the contract is internally consistent. Both are
needed; only the second one is this repository's to answer.

`runner/` also carries the online half of that runner, which measures a *running runtime*. This
repository has no runtime to measure, so nothing here runs it. See [`runner/README.md`](runner/README.md)
for what belongs there and what has not arrived yet.

## Style

- File names carry a version segment and **no timestamp** — deterministic and diffable.
- `schemas/` is referenced by `wire-schema-registry.json`'s `schemasDir`. **The directory name is part
  of the contract**; it does not get renamed.
- A schema with a cross-file relative `$ref` must use a bare `$id`. A `v<N>/` prefix sends the
  relative resolution into a directory that does not exist — this has already happened once.
- Samples are illustrations, not assertions. They must still validate against their schema.
