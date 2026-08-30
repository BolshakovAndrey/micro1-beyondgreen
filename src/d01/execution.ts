/** Derives auditable process-isolation and K=0 claims from measured execution events. */
import { canonicalJson, sha256 } from "./canonical-json.ts";
import {
  ExecutionClaimsSchema, type FinalizedDecision,
  type CapabilityProof, type ExecutionClaims, type ExecutionEvent,
} from "./schemas.ts";
import type { FixtureEngineBindings } from "./engine.ts";

/** Injects descriptor-specific runtime validation into generic event-claim derivation. */
export type ExecutionValidationBindings = Readonly<{
  descriptor: FixtureEngineBindings["descriptor"];
  schemas: Pick<FixtureEngineBindings["schemas"], "parseExecutionEvent" | "parseCapabilityProof">;
}>;

/** Derive execution-order and oracle-boundary claims only from measured process events. */
export function deriveExecutionClaims(
  engine: ExecutionValidationBindings,
  input: readonly ExecutionEvent[],
  proofInput: readonly CapabilityProof[],
  expectedDecisions: Readonly<Record<"status-quo" | "beyondgreen", FinalizedDecision>>,
  expectedPolicies: ReadonlyMap<string, Readonly<{
    executionSlot: string;
    role: CapabilityProof["worker"]["role"];
    capabilityProfile: CapabilityProof["worker"]["capabilityProfile"];
    sandboxPolicyCanonical: CapabilityProof["launch"]["sandboxPolicyCanonical"];
    sandboxPolicySha256: string;
    allowedReadPathsCanonical: readonly string[];
    allowedReadPathsSha256: string;
  }>>,
): Readonly<{
  events: readonly ExecutionEvent[];
  capabilityProofs: readonly CapabilityProof[];
  order: readonly string[];
  claims: ExecutionClaims;
}> {
  const events = input.map((event) => engine.schemas.parseExecutionEvent(event) as ExecutionEvent);
  const capabilityProofs = proofInput.map((proof) => engine.schemas.parseCapabilityProof(proof) as CapabilityProof);
  const armCount = engine.descriptor.engine.armIds.length;
  if (events.length !== (8 * armCount) + 2 || capabilityProofs.length !== 4 * armCount) {
    throw new Error("Execution event or capability-evidence cardinality is incomplete.");
  }
  for (const [index, event] of events.entries()) {
    if (event.sequence !== index + 1 || (index > 0 && event.monotonicMs < events[index - 1]!.monotonicMs)) {
      throw new Error("Execution events are not a measured monotonic sequence.");
    }
  }
  const event = (kind: ExecutionEvent["kind"], arm?: "status-quo" | "beyondgreen") => {
    const found = events.find((item) => item.kind === kind && (arm === undefined || item.arm === arm));
    if (!found) throw new Error(`Required measured execution event is missing: ${kind}.`);
    return found;
  };
  const statusFinalized = event("arm_decision_finalized", "status-quo");
  const beyondFinalized = event("arm_decision_finalized", "beyondgreen");
  const allFinalized = event("all_arm_decisions_finalized");
  const verifierValidated = event("verifier_package_validated");
  const evaluatorStarts = events.filter((item) => item.kind === "evaluator_started");
  const exactCount = (kind: ExecutionEvent["kind"], expected: number) => (
    events.filter((item) => item.kind === kind).length === expected
  );
  if (allFinalized.sequence <= Math.max(statusFinalized.sequence, beyondFinalized.sequence)
    || verifierValidated.sequence <= allFinalized.sequence
    || evaluatorStarts.length !== engine.descriptor.engine.armIds.length
    || evaluatorStarts.some((item) => item.sequence <= allFinalized.sequence)
    || !exactCount("arm_started", armCount) || !exactCount("arm_decision_finalized", armCount)
    || !exactCount("all_arm_decisions_finalized", 1) || !exactCount("verifier_package_validated", 1)
    || !exactCount("observation_started", 2 * armCount) || !exactCount("observation_completed", 2 * armCount)
    || !exactCount("evaluator_completed", armCount)) {
    throw new Error("Verifier access or evaluation occurred before both arm decisions finalized.");
  }
  const proofByDigest = new Map<string, CapabilityProof>();
  const processIdentities = new Set<string>();
  const proofBySlot = new Map<string, CapabilityProof>();
  for (const proof of capabilityProofs) {
    const expectedPolicy = expectedPolicies.get(proof.worker.executionSlot);
    if (sha256(canonicalJson({ launch: proof.launch, worker: proof.worker })) !== proof.proofSha256
      || !expectedPolicy
      || proof.worker.role !== expectedPolicy.role
      || proof.worker.capabilityProfile !== expectedPolicy.capabilityProfile
      || canonicalJson(proof.launch.sandboxPolicyCanonical) !== canonicalJson(expectedPolicy.sandboxPolicyCanonical)
      || proof.launch.sandboxPolicySha256 !== expectedPolicy.sandboxPolicySha256
      || canonicalJson(proof.launch.allowedReadPathsCanonical) !== canonicalJson(expectedPolicy.allowedReadPathsCanonical)
      || proof.launch.allowedReadPathsSha256 !== expectedPolicy.allowedReadPathsSha256
      || proof.launch.capabilityProfile !== proof.worker.capabilityProfile
      || proof.launch.executionSlot !== proof.worker.executionSlot
      || proof.launch.launchBindingSha256 !== proof.worker.launchBindingSha256
      || sha256(canonicalJson(proof.launch.sandboxPolicyCanonical)) !== proof.launch.sandboxPolicySha256
      || sha256(canonicalJson(proof.launch.allowedReadPathsCanonical)) !== proof.launch.allowedReadPathsSha256
      || [...proof.launch.allowedReadPathsCanonical].sort((left, right) => left.localeCompare(right, "en"))
        .some((item, index) => item !== proof.launch.allowedReadPathsCanonical[index])
      || new Set(proof.launch.allowedReadPathsCanonical).size !== proof.launch.allowedReadPathsCanonical.length
      || proofByDigest.has(proof.proofSha256)
      || proofBySlot.has(proof.worker.executionSlot)
      || processIdentities.has(proof.worker.processIdentitySha256)) {
      throw new Error("Capability evidence is tampered, duplicated, or has inconsistent process identity.");
    }
    proofByDigest.set(proof.proofSha256, proof);
    proofBySlot.set(proof.worker.executionSlot, proof);
    processIdentities.add(proof.worker.processIdentitySha256);
    const armLike = proof.worker.role === "arm" || proof.worker.role === "candidate_observer";
    if (armLike !== (proof.worker.verifierReadDenied && proof.worker.candidateReadAllowed)
      || (!armLike) !== (proof.worker.verifierReadAllowed && proof.worker.candidateReadDenied)
      || !proof.launch.networkEgressDenied || proof.launch.hostPathInherited) {
      throw new Error("Runner-produced capability evidence contradicts the required oracle boundary.");
    }
  }
  const expectedSlots = engine.descriptor.engine.armIds.flatMap((arm) => [
    [`${arm}:arm`, "arm", "arm_visible"],
    [`${arm}:observer:1`, "candidate_observer", "candidate_observer"],
    [`${arm}:observer:2`, "candidate_observer", "candidate_observer"],
    [`${arm}:evaluator`, "evaluator", "verifier_only"],
  ] as const);
  if (expectedSlots.length !== proofBySlot.size || expectedPolicies.size !== expectedSlots.length
    || expectedSlots.some(([slot, role, profile]) => {
    const proof = proofBySlot.get(slot);
    return !proof || proof.worker.role !== role || proof.worker.capabilityProfile !== profile;
  })) {
    throw new Error("Capability role, profile, execution slot, and proof do not form an exact bijection.");
  }
  const boundEvents = events.filter((item) => item.capabilityProofSha256 !== null);
  if (boundEvents.length !== capabilityProofs.length || boundEvents.some((item) => {
    const proof = proofByDigest.get(item.capabilityProofSha256!);
    return !proof || proof.worker.capabilityProfile !== item.capabilityProfile
      || proof.worker.executionSlot !== item.executionSlot
      || proof.worker.verifierReadAllowed !== item.verifierReadAllowed
      || proof.worker.candidateReadAllowed !== item.candidateReadAllowed
      || proof.launch.networkEgressDenied !== item.networkDenied
      || proof.launch.hostPathInherited !== item.hostPathInherited;
  })) {
    throw new Error("Execution events are missing or contradict bound capability evidence.");
  }
  const roleCount = (role: CapabilityProof["worker"]["role"]) => (
    capabilityProofs.filter((proof) => proof.worker.role === role).length
  );
  if (roleCount("arm") !== armCount || roleCount("candidate_observer") !== 2 * armCount
    || roleCount("evaluator") !== armCount) {
    throw new Error("Measured process capabilities do not prove the required oracle boundary.");
  }
  for (const arm of engine.descriptor.engine.armIds) {
    const armEvents = events.filter((item) => item.arm === arm);
    const expectedKinds: readonly ExecutionEvent["kind"][] = [
      "arm_started", "arm_decision_finalized",
      "observation_started", "observation_completed",
      "observation_started", "observation_completed",
      "evaluator_started", "evaluator_completed",
    ];
    const finalized = armEvents[1];
    const actualDecision = expectedDecisions[arm];
    if (armEvents.length !== expectedKinds.length
      || armEvents.some((item, index) => item.kind !== expectedKinds[index])
      || !finalized?.decisionSha256
      || actualDecision.decision.arm !== arm
      || finalized.decisionSha256 !== actualDecision.decisionSha256
      || armEvents.slice(1).some((item) => item.decisionSha256 !== finalized.decisionSha256)
      || armEvents[0]?.decisionSha256 !== null
      || armEvents[0]?.executionSlot !== `${arm}:arm`
      || armEvents[1]?.executionSlot !== `${arm}:arm`
      || armEvents[2]?.executionSlot !== `${arm}:observer:1`
      || armEvents[3]?.executionSlot !== `${arm}:observer:1`
      || armEvents[4]?.executionSlot !== `${arm}:observer:2`
      || armEvents[5]?.executionSlot !== `${arm}:observer:2`
      || armEvents[6]?.executionSlot !== `${arm}:evaluator`
      || armEvents[7]?.executionSlot !== `${arm}:evaluator`) {
      throw new Error(`Execution events violate the per-arm state machine for ${arm}.`);
    }
  }
  return Object.freeze({
    events: Object.freeze(events),
    capabilityProofs: Object.freeze(capabilityProofs),
    order: Object.freeze(events.map((item) => `${item.sequence}:${item.kind}:${item.arm ?? "run"}`)),
    claims: ExecutionClaimsSchema.parse({
      physicalProcessIsolation: true,
      k: 0,
      armProcessesCouldReadVerifierOnly: false,
      evaluatorStartedAfterBothDecisions: true,
      candidateExecutedInsideOracleProcess: false,
      networkEgressDenied: true,
      hostPathInherited: false,
      derivedFromMeasuredEvents: true,
    }),
  });
}
