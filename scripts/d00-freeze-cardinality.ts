#!/usr/bin/env node
/** Verifies frozen benchmark cardinality and ground-truth labels without executing an arm. */

import { existsSync, readFileSync } from "node:fs";
import { FIXTURES } from "../src/fixtures/development.ts";

type CandidateLabel = "preserving" | "false_green";

function groundTruthLabels(fixtureId: string): ReadonlyMap<string, CandidateLabel> {
  const path = `evaluation/verifier-only/${fixtureId}/ground-truth.json`;
  const value = JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  if (value.fixture_id !== fixtureId) throw new Error(`${fixtureId} ground truth fixture identity mismatch.`);
  if (typeof value.behavior_class !== "string") throw new Error(`${fixtureId} ground truth has no behavior class.`);

  const candidates = value.candidates;
  if (candidates && typeof candidates === "object" && !Array.isArray(candidates)) {
    return new Map(Object.entries(candidates as Record<string, CandidateLabel>));
  }
  const candidateA = value.candidate_a;
  const candidateB = value.candidate_b;
  if ((candidateA === "preserving" || candidateA === "false_green") &&
      (candidateB === "preserving" || candidateB === "false_green")) {
    return new Map([["candidate-a", candidateA], ["candidate-b", candidateB]]);
  }
  throw new Error(`${fixtureId} ground truth candidate mapping is unsupported.`);
}

if (FIXTURES.length !== 10) throw new Error(`Expected 10 fixtures, found ${FIXTURES.length}.`);
if (FIXTURES.filter(({ membership }) => membership === "development").length !== 4 ||
    FIXTURES.filter(({ membership }) => membership === "held_out").length !== 6) {
  throw new Error("Frozen benchmark membership must remain exactly 4 development / 6 held-out.");
}
if (new Set(FIXTURES.map(({ behaviorClass }) => behaviorClass)).size !== 10) {
  throw new Error("Frozen behavior-class assignment is not a ten-class bijection.");
}

let preserving = 0;
let falseGreen = 0;
for (const fixture of FIXTURES) {
  if (fixture.candidateIds.length !== 2) throw new Error(`${fixture.fixtureId} must expose exactly two candidates.`);
  const labels = groundTruthLabels(fixture.fixtureId);
  if (labels.size !== 2) throw new Error(`${fixture.fixtureId} ground truth must contain exactly two candidates.`);
  if (JSON.stringify([...labels.keys()].sort()) !== JSON.stringify([...fixture.candidateIds].sort())) {
    throw new Error(`${fixture.fixtureId} descriptor and ground-truth candidate identities differ.`);
  }
  for (const label of labels.values()) {
    if (label === "preserving") preserving += 1;
    else if (label === "false_green") falseGreen += 1;
    else throw new Error(`${fixture.fixtureId} has an unknown ground-truth label.`);
  }
  const groundTruth = JSON.parse(
    readFileSync(`evaluation/verifier-only/${fixture.fixtureId}/ground-truth.json`, "utf8"),
  ) as Record<string, unknown>;
  const rejectReason = groundTruth.allowed_false_green_defect_family ?? groundTruth.failure_invariant;
  if (typeof rejectReason !== "string" || rejectReason.trim().length === 0) {
    throw new Error(`${fixture.fixtureId} has no frozen reason-correct reject family.`);
  }
  if (!existsSync(fixture.armVisibleRoot) || !existsSync(fixture.verifierOnlyRoot)) {
    throw new Error(`${fixture.fixtureId} package roots are incomplete.`);
  }
  for (const manifestPath of fixture.manifestPaths) {
    if (!existsSync(manifestPath)) throw new Error(`Missing frozen manifest: ${manifestPath}`);
  }
}

if (preserving !== 10 || falseGreen !== 10) {
  throw new Error(`Expected 10 preserving and 10 false-green candidates, found ${preserving}/${falseGreen}.`);
}

const assignments = readFileSync("evaluation/fixture-assignments.yaml", "utf8");
const challenging = [...assignments.matchAll(/fixture_id: "([^"]+)"[^\n]+challenging_case: true/g)]
  .map((match) => match[1]);
if (challenging.length !== 1 || challenging[0] !== "BG-H02") {
  throw new Error(`Expected BG-H02 as the sole challenging case, found ${challenging.join(",") || "none"}.`);
}

process.stdout.write(
  "FREEZE_CARDINALITY_PASSED fixtures=10 candidates=20 development=4 held_out=6 " +
  "evaluator_accept=10 evaluator_reason_correct_reject=10 challenging=BG-H02\n",
);
