/** Exposes only the D01 runtime operations safe for arm and observer worker graphs. */
import path from "node:path";
import { pathToFileURL } from "node:url";

import { mountMuseumBoard } from "../../evaluation/arm-visible/BG-D01/harness.ts";
import type {
  BoardAction, BoardObservation, MuseumBoardComponent,
} from "../../evaluation/arm-visible/BG-D01/contract.ts";
import {
  assertCandidateUnchanged, ingestCandidate, validateBoundPackage,
} from "./candidate.ts";
import {
  decide, evaluatorInputSha256, finalizeDecision, finalizeObservationPair, verifyFinalizedDecision,
} from "./decision.ts";
import { candidateDescriptor } from "./fixture.ts";
import { inventoryRisk } from "./risk.ts";
import type { CandidateId } from "./schemas.ts";

const OBSERVATION_ACTIONS: readonly BoardAction[] = [
  { type: "select-all" },
  { type: "allocate", multiplicity: 2 },
  { type: "set-step", value: 3 },
  { type: "allocate", multiplicity: 2 },
  { type: "select-every-third" },
  { type: "remove", multiplicity: 1 },
  { type: "reset" },
  { type: "reset" },
];

async function importD01Candidate(repositoryRoot: string, candidateId: string) {
  const sourcePath = path.resolve(repositoryRoot, candidateDescriptor(candidateId as CandidateId).sourcePath);
  return import(pathToFileURL(sourcePath).href) as Promise<{ MuseumBoard: MuseumBoardComponent }>;
}

/** Supply D01 operations safe to load in arm and candidate-observer processes. */
export const D01_RUNTIME_BINDINGS = Object.freeze({
  describeCandidate: (candidateId: string) => candidateDescriptor(candidateId as CandidateId),
  ingestCandidate: (repositoryRoot: string, candidateId: string) => (
    ingestCandidate(repositoryRoot, candidateId as CandidateId)
  ),
  assertCandidateUnchanged,
  validatePackage: validateBoundPackage,
  inventoryRisk,
  importCandidate: importD01Candidate,
  captureObservations: async (repositoryRoot: string, candidateId: string) => {
    const module = await importD01Candidate(repositoryRoot, candidateId);
    const board = await mountMuseumBoard(module.MuseumBoard);
    try {
      const observations: BoardObservation[] = [board.observe()];
      for (const action of OBSERVATION_ACTIONS) observations.push(await board.dispatch(action));
      return observations;
    }
    finally {
      await board.dispose();
    }
  },
  decide,
  finalizeDecision,
  verifyFinalizedDecision,
  finalizeObservationPair,
  evaluatorInputSha256,
});
