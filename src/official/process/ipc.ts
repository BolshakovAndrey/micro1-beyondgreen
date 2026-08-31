import { createHash } from "node:crypto";

import { z } from "zod";

import { OFFICIAL_HANDLER_FAILURE_STAGES } from "./handler-stage.ts";

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const FixtureIdSchema = z.string().regex(/^BG-(?:D0[1-4]|H0[1-6])$/u);
const IdentifierSchema = z.string().min(1).max(160).regex(/^[A-Za-z0-9._:-]+$/u);
const ArmSchema = z.enum(["status-quo", "beyondgreen"]);
const VerdictSchema = z.enum(["accept", "reject", "abstain"]);
const ScenarioForbiddenKeyPattern = /(?:oracle|ground.?truth|expected|verdict|diagnostic|diff|reason.?correct|accepted|failure)/iu;

/** Immutable identity shared by every role process for one candidate slot. */
export const OfficialProcessSlotSchema = z.object({
  slotId: IdentifierSchema,
  fixtureId: FixtureIdSchema,
  candidateId: IdentifierSchema,
  candidateSha256: Sha256Schema,
}).strict().superRefine((slot, context) => {
  if (slot.slotId !== `${slot.fixtureId}:${slot.candidateId}`) {
    context.addIssue({ code: "custom", path: ["slotId"], message: "Slot id must explicitly bind fixture and candidate ids." });
  }
});
export type OfficialProcessSlot = z.infer<typeof OfficialProcessSlotSchema>;

const RequestBaseSchema = z.object({
  schemaVersion: z.literal("beyondgreen-official-process-ipc@1.0.0"),
  requestId: IdentifierSchema,
  evaluationVersion: z.literal("eval-v1.1.0"),
  slot: OfficialProcessSlotSchema,
  inputSha256: Sha256Schema,
});

const ArmDecisionCoreSchema = z.object({
  schemaVersion: z.literal("beyondgreen-official-arm-decision@1.0.0"),
  slot: OfficialProcessSlotSchema,
  arm: ArmSchema,
  verdict: VerdictSchema,
  rationale: z.string().min(1).max(8_192),
  inputSha256: Sha256Schema,
  evidenceSha256: Sha256Schema,
  immutable: z.literal(true),
}).strict();

/** Canonical immutable arm decision. Its digest excludes only the digest field itself. */
export const OfficialImmutableArmDecisionSchema = ArmDecisionCoreSchema.extend({
  decisionSha256: Sha256Schema,
}).strict().superRefine((decision, context) => {
  const { decisionSha256: _digest, ...core } = decision;
  if (sha256CanonicalJson(core) !== decision.decisionSha256) {
    context.addIssue({ code: "custom", path: ["decisionSha256"], message: "Decision digest mismatch." });
  }
});
export type OfficialImmutableArmDecision = z.infer<typeof OfficialImmutableArmDecisionSchema>;

export const OfficialArmProcessRequestSchema = RequestBaseSchema.extend({
  role: z.literal("arm"),
  operation: z.literal("decide"),
  arm: ArmSchema,
  attemptOrdinal: z.literal(1),
  payload: z.json(),
}).strict();
export type OfficialArmProcessRequest = z.infer<typeof OfficialArmProcessRequestSchema>;

export const OfficialArmHandlerOutputSchema = z.object({
  verdict: VerdictSchema,
  rationale: z.string().min(1).max(8_192),
  evidence: z.json(),
}).strict();
export type OfficialArmHandlerOutput = z.infer<typeof OfficialArmHandlerOutputSchema>;

export const OfficialArmProcessSuccessSchema = z.object({
  schemaVersion: z.literal("beyondgreen-official-arm-process-result@1.0.0"),
  requestId: IdentifierSchema,
  role: z.literal("arm"),
  status: z.literal("ok"),
  decision: OfficialImmutableArmDecisionSchema,
}).strict();
export type OfficialArmProcessSuccess = z.infer<typeof OfficialArmProcessSuccessSchema>;

function checkFinalDecisionSet(
  decisions: readonly OfficialImmutableArmDecision[],
  slot: OfficialProcessSlot,
  inputSha256: string,
): string | undefined {
  if (decisions.length !== 2 || new Set(decisions.map(({ arm }) => arm)).size !== 2) {
    return "Both distinct arm decisions are required before post-decision roles.";
  }
  if (decisions.some((decision) => (
    !sameSlot(decision.slot, slot)
    || decision.inputSha256 !== inputSha256
    || decision.immutable !== true
  ))) {
    return "Arm decisions must be immutable and bound to the same slot and input.";
  }
  return undefined;
}

function sameSlot(left: OfficialProcessSlot, right: OfficialProcessSlot): boolean {
  return left.slotId === right.slotId
    && left.fixtureId === right.fixtureId
    && left.candidateId === right.candidateId
    && left.candidateSha256 === right.candidateSha256;
}

const FinalDecisionPairSchema = z.tuple([
  OfficialImmutableArmDecisionSchema,
  OfficialImmutableArmDecisionSchema,
]);

function findForbiddenScenarioKey(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    for (const child of value) {
      const finding = findForbiddenScenarioKey(child);
      if (finding) return finding;
    }
    return undefined;
  }
  if (value === null || typeof value !== "object") return undefined;
  for (const [key, child] of Object.entries(value)) {
    if (ScenarioForbiddenKeyPattern.test(key)) return key;
    const finding = findForbiddenScenarioKey(child);
    if (finding) return finding;
  }
  return undefined;
}

const NeutralScenarioStepSchema = z.object({
  action: IdentifierSchema,
  parameters: z.json(),
}).strict().superRefine((step, context) => {
  const forbidden = findForbiddenScenarioKey(step.parameters);
  if (forbidden) {
    context.addIssue({ code: "custom", path: ["parameters"], message: "Scenario parameters contain an evaluator-shaped key." });
  }
});

const NeutralScenarioCoreSchema = z.object({
  schemaVersion: z.literal("beyondgreen-official-neutral-scenario@1.0.0"),
  slot: OfficialProcessSlotSchema,
  scenarioId: IdentifierSchema,
  decisionSetSha256: Sha256Schema,
  steps: z.array(NeutralScenarioStepSchema).min(1).max(256).readonly(),
  immutable: z.literal(true),
}).strict();

/** Post-decision actions stripped of every evaluator-owned outcome or diagnostic. */
export const OfficialNeutralScenarioEnvelopeSchema = NeutralScenarioCoreSchema.extend({
  scenarioSha256: Sha256Schema,
}).strict().superRefine((scenario, context) => {
  const { scenarioSha256: _digest, ...core } = scenario;
  if (sha256CanonicalJson(core) !== scenario.scenarioSha256) {
    context.addIssue({ code: "custom", path: ["scenarioSha256"], message: "Neutral scenario digest mismatch." });
  }
});
export type OfficialNeutralScenarioEnvelope = z.infer<typeof OfficialNeutralScenarioEnvelopeSchema>;

export const OfficialScenarioProviderProcessRequestSchema = RequestBaseSchema.extend({
  role: z.literal("scenario-provider"),
  operation: z.literal("release_after_all_decisions"),
  decisions: z.array(OfficialImmutableArmDecisionSchema).length(40).readonly(),
  payload: z.json(),
}).strict().superRefine((request, context) => {
  const identities = request.decisions.map(({ slot, arm }) => `${slot.slotId}:${arm}`);
  if (new Set(identities).size !== 40 || request.decisions.some(({ immutable }) => immutable !== true)) {
    context.addIssue({ code: "custom", path: ["decisions"], message: "Scenario release requires 40 unique immutable arm decisions." });
  }
  const slotDecisions = request.decisions.filter(({ slot }) => sameSlot(slot, request.slot));
  if (slotDecisions.length !== 2 || new Set(slotDecisions.map(({ arm }) => arm)).size !== 2) {
    context.addIssue({ code: "custom", path: ["slot"], message: "Scenario slot must have both immutable arm decisions." });
  }
});
export type OfficialScenarioProviderProcessRequest = z.infer<typeof OfficialScenarioProviderProcessRequestSchema>;

export const OfficialScenarioProviderHandlerOutputSchema = z.object({
  scenarioId: IdentifierSchema,
  steps: z.array(NeutralScenarioStepSchema).min(1).max(256).readonly(),
}).strict();
export type OfficialScenarioProviderHandlerOutput = z.infer<typeof OfficialScenarioProviderHandlerOutputSchema>;

export const OfficialScenarioProviderProcessSuccessSchema = z.object({
  schemaVersion: z.literal("beyondgreen-official-scenario-provider-result@1.0.0"),
  requestId: IdentifierSchema,
  role: z.literal("scenario-provider"),
  status: z.literal("ok"),
  scenario: OfficialNeutralScenarioEnvelopeSchema,
}).strict();
export type OfficialScenarioProviderProcessSuccess = z.infer<typeof OfficialScenarioProviderProcessSuccessSchema>;

export const OfficialObserverProcessRequestSchema = RequestBaseSchema.extend({
  role: z.literal("observer"),
  operation: z.literal("capture_after_decisions"),
  targetArm: ArmSchema,
  decisions: FinalDecisionPairSchema,
  payload: z.json(),
}).strict().superRefine((request, context) => {
  const issue = checkFinalDecisionSet(request.decisions, request.slot, request.inputSha256);
  if (issue) context.addIssue({ code: "custom", path: ["decisions"], message: issue });
  if (!request.decisions.some(({ arm }) => arm === request.targetArm)) {
    context.addIssue({ code: "custom", path: ["targetArm"], message: "Target arm has no immutable decision." });
  }
});
export type OfficialObserverProcessRequest = z.infer<typeof OfficialObserverProcessRequestSchema>;

/** Production observer request that must bind one released neutral scenario. */
export const OfficialScenarioBoundObserverProcessRequestSchema = z.intersection(
  OfficialObserverProcessRequestSchema,
  z.object({ scenario: OfficialNeutralScenarioEnvelopeSchema }).strict(),
).superRefine((request, context) => {
  if (!sameSlot(request.scenario.slot, request.slot)) {
    context.addIssue({ code: "custom", path: ["scenario"], message: "Observer scenario is bound to a different slot." });
  }
});
export type OfficialScenarioBoundObserverProcessRequest = z.infer<typeof OfficialScenarioBoundObserverProcessRequestSchema>;

export const OfficialObserverHandlerOutputSchema = z.object({
  transcript: z.json(),
}).strict();
export type OfficialObserverHandlerOutput = z.infer<typeof OfficialObserverHandlerOutputSchema>;

const ObserverCaptureCoreSchema = z.object({
  schemaVersion: z.literal("beyondgreen-official-observer-capture@1.0.0"),
  slot: OfficialProcessSlotSchema,
  arm: ArmSchema,
  decisionSha256: Sha256Schema,
  transcript: z.json(),
  transcriptSha256: Sha256Schema,
  immutable: z.literal(true),
}).strict();

/** Neutral post-decision observation transcript and its canonical binding digest. */
export const OfficialObserverCaptureSchema = ObserverCaptureCoreSchema.extend({
  captureSha256: Sha256Schema,
}).strict().superRefine((capture, context) => {
  if (sha256CanonicalJson(capture.transcript) !== capture.transcriptSha256) {
    context.addIssue({ code: "custom", path: ["transcriptSha256"], message: "Transcript digest mismatch." });
  }
  const { captureSha256: _digest, ...core } = capture;
  if (sha256CanonicalJson(core) !== capture.captureSha256) {
    context.addIssue({ code: "custom", path: ["captureSha256"], message: "Capture digest mismatch." });
  }
});
export type OfficialObserverCapture = z.infer<typeof OfficialObserverCaptureSchema>;

export const OfficialObserverProcessSuccessSchema = z.object({
  schemaVersion: z.literal("beyondgreen-official-observer-process-result@1.0.0"),
  requestId: IdentifierSchema,
  role: z.literal("observer"),
  status: z.literal("ok"),
  capture: OfficialObserverCaptureSchema,
}).strict();
export type OfficialObserverProcessSuccess = z.infer<typeof OfficialObserverProcessSuccessSchema>;

export const OfficialEvaluatorProcessRequestSchema = RequestBaseSchema.extend({
  role: z.literal("evaluator"),
  operation: z.literal("evaluate_after_capture"),
  targetArm: ArmSchema,
  decisions: FinalDecisionPairSchema,
  capture: OfficialObserverCaptureSchema,
  payload: z.json(),
}).strict().superRefine((request, context) => {
  const issue = checkFinalDecisionSet(request.decisions, request.slot, request.inputSha256);
  if (issue) context.addIssue({ code: "custom", path: ["decisions"], message: issue });
  const decision = request.decisions.find(({ arm }) => arm === request.targetArm);
  if (!decision || request.capture.arm !== request.targetArm
    || request.capture.decisionSha256 !== decision.decisionSha256
    || !sameSlot(request.capture.slot, request.slot)) {
    context.addIssue({
      code: "custom",
      path: ["capture"],
      message: "Evaluator capture must be bound to the selected immutable decision and slot.",
    });
  }
});
export type OfficialEvaluatorProcessRequest = z.infer<typeof OfficialEvaluatorProcessRequestSchema>;

export const OfficialEvaluatorHandlerOutputSchema = z.object({
  groundTruth: z.enum(["preserving", "false_green"]),
  reasonCorrectReject: z.boolean(),
  schemaValidCompleteReport: z.boolean(),
  evidence: z.json(),
}).strict();
export type OfficialEvaluatorHandlerOutput = z.infer<typeof OfficialEvaluatorHandlerOutputSchema>;

export const OfficialEvaluatorProcessSuccessSchema = z.object({
  schemaVersion: z.literal("beyondgreen-official-evaluator-process-result@1.0.0"),
  requestId: IdentifierSchema,
  role: z.literal("evaluator"),
  status: z.literal("ok"),
  decisionSha256: Sha256Schema,
  captureSha256: Sha256Schema,
  record: z.object({
    evaluationVersion: z.literal("eval-v1.1.0"),
    fixtureId: FixtureIdSchema,
    candidateId: IdentifierSchema,
    arm: ArmSchema,
    verdict: VerdictSchema,
    groundTruth: z.enum(["preserving", "false_green"]),
    reasonCorrectReject: z.boolean(),
    schemaValidCompleteReport: z.boolean(),
  }).strict(),
  evaluatorEvidenceSha256: Sha256Schema,
  immutable: z.literal(true),
}).strict();
export type OfficialEvaluatorProcessSuccess = z.infer<typeof OfficialEvaluatorProcessSuccessSchema>;

export const OfficialProcessFailureSchema = z.object({
  schemaVersion: z.literal("beyondgreen-official-process-failure@1.0.0"),
  requestId: IdentifierSchema.nullable(),
  role: z.enum(["arm", "scenario-provider", "observer", "evaluator"]).nullable(),
  status: z.literal("error"),
  disposition: z.literal("abstain"),
  retryAllowed: z.literal(false),
  errorCode: z.enum([
    "MALFORMED_IPC",
    "HANDLER_FAILURE",
    "OUTPUT_SCHEMA_FAILURE",
    "REQUEST_BINDING_FAILURE",
  ]),
  failureStage: z.enum(OFFICIAL_HANDLER_FAILURE_STAGES).nullable(),
  message: z.string().min(1),
}).strict();
export type OfficialProcessFailure = z.infer<typeof OfficialProcessFailureSchema>;

/** RFC-8785-compatible canonicalization for the JSON-only IPC surface. */
export function canonicalizeProcessJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("IPC canonical JSON rejects non-finite numbers.");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalizeProcessJson).join(",")}]`;
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => (
      `${JSON.stringify(key)}:${canonicalizeProcessJson(record[key])}`
    )).join(",")}}`;
  }
  throw new Error("IPC canonical JSON accepts only JSON-compatible values.");
}

/** Compute the lowercase SHA-256 used to bind every IPC phase. */
export function sha256CanonicalJson(value: unknown): string {
  return createHash("sha256").update(canonicalizeProcessJson(value)).digest("hex");
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

/** Parse a strict schema and recursively freeze the accepted IPC value. */
export function parseAndFreezeProcessIpc<T>(schema: z.ZodType<T>, input: unknown): T {
  return deepFreeze(schema.parse(input));
}
