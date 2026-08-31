import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  existsSync,
  fsyncSync,
  linkSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { z } from "zod";

import { OfficialScoredRecordSchema, type OfficialScoredRecord } from "../aggregation.ts";
import { canonicalJson } from "../canonical-json.ts";
import { OfficialExecutionPlanSchema, type OfficialExecutionPlan } from "../integration/execution-plan.ts";
import { createOfficialReplayBundle, replayOfficialBundle, type OfficialReplayBundle } from "../replay.ts";
import {
  OfficialImmutableArmDecisionSchema,
  parseAndFreezeProcessIpc,
  sha256CanonicalJson,
  type OfficialImmutableArmDecision,
  type OfficialNeutralScenarioEnvelope,
  type OfficialProcessFailure,
} from "../process/ipc.ts";
import { OfficialRoleProcessFailureError } from "./production-composition.ts";
import {
  finalizeOfficialObservationPair,
  parseOfficialNeutralScenario,
  parseOfficialObserverCapture,
  toOfficialProcessSlot,
  type OfficialArm,
  type OfficialObservationPair,
} from "./contracts.ts";
import type { OfficialExecutionHooks } from "./coordinator.ts";

const ARMS = ["status-quo", "beyondgreen"] as const;
const SOURCE_CONTROL_FILES = [
  "execution-plan.json",
  "provenance.json",
  "run-manifest.json",
  "static-preflight.json",
] as const;
const SOURCE_TOP_LEVEL = [
  "arm-records",
  "evaluator-records",
  "execution-plan.json",
  "observer-records",
  "provenance.json",
  "run-manifest.json",
  "static-preflight.json",
] as const;
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);

export const OFFICIAL_POST_DECISION_SOURCE_ROOT = "artifacts/evaluation/official/RUN-BG-OFFICIAL-EVAL-V1.1.0-002";
export const OFFICIAL_POST_DECISION_SOURCE_MANIFEST = "artifacts/evaluation/official/RUN-BG-OFFICIAL-EVAL-V1.1.0-002.source-manifest.json";
export const OFFICIAL_POST_DECISION_OUTPUT_ROOT = "artifacts/evaluation/official/RUN-BG-OFFICIAL-EVAL-V1.1.0-002-POSTDECISION-004";
export const OFFICIAL_POST_DECISION_INVENTORY_DRIFT_REASON = "owner-approved verifier repairs SES-20260831-034 and SES-20260831-037";
export const OFFICIAL_POST_DECISION_SOURCE_INVENTORY_SHA256 = "4b9d4100667af58f7b995ff00d4c39b81922a8cf4656c0a93fa59c7ecc0a345c";
export const OFFICIAL_POST_DECISION_CURRENT_INVENTORY_SHA256 = "5eb206c286a7fba03885f2e2ebed0250fd154b42f13237c2525eb4781af541cf";

const SourceFileSchema = z.object({
  path: z.string().min(1),
  bytes: z.number().int().positive(),
  sha256: Sha256Schema,
}).strict();

export const OfficialPostDecisionSourceManifestSchema = z.object({
  schemaVersion: z.literal("beyondgreen-official-post-decision-source@1.0.0"),
  sourceOutputRoot: z.string().min(1),
  fileCount: z.literal(44),
  armRecordCount: z.literal(40),
  totalBytes: z.number().int().positive(),
  bundleSha256: Sha256Schema,
  files: z.array(SourceFileSchema).length(44).readonly(),
}).strict().superRefine((manifest, context) => {
  const sorted = [...manifest.files].sort((left, right) => left.path.localeCompare(right.path, "en"));
  if (sorted.some((entry, index) => entry.path !== manifest.files[index]?.path)) {
    context.addIssue({ code: "custom", path: ["files"], message: "Source manifest paths must be sorted." });
  }
  if (new Set(manifest.files.map(({ path: filePath }) => filePath)).size !== 44) {
    context.addIssue({ code: "custom", path: ["files"], message: "Source manifest paths must be unique." });
  }
  if (manifest.files.reduce((total, entry) => total + entry.bytes, 0) !== manifest.totalBytes) {
    context.addIssue({ code: "custom", path: ["totalBytes"], message: "Source byte total does not match entries." });
  }
  if (sha256CanonicalJson(manifest.files) !== manifest.bundleSha256) {
    context.addIssue({ code: "custom", path: ["bundleSha256"], message: "Source bundle digest does not match entries." });
  }
});
export type OfficialPostDecisionSourceManifest = z.infer<typeof OfficialPostDecisionSourceManifestSchema>;

const ArmRecordSchema = z.object({
  ordinal: z.number().int().min(1).max(20),
  arm: z.enum(ARMS),
  decision: OfficialImmutableArmDecisionSchema,
  candidateSha256Before: Sha256Schema,
  candidateSha256After: Sha256Schema,
  reasoningInvocationCount: z.union([z.literal(0), z.literal(1)]),
  retryCount: z.literal(0),
}).strict();

export type OfficialPostDecisionRecoverySource = Readonly<{
  manifest: OfficialPostDecisionSourceManifest;
  plan: OfficialExecutionPlan;
  decisions: readonly OfficialImmutableArmDecision[];
}>;

export type OfficialPostDecisionInventoryDriftDisclosure = Readonly<{
  expectedSourceInventorySha256: string;
  expectedCurrentInventorySha256: string;
  reason: typeof OFFICIAL_POST_DECISION_INVENTORY_DRIFT_REASON;
}>;

export type OfficialPostDecisionRecoveryResult = Readonly<{
  schemaVersion: "beyondgreen-official-post-decision-recovery-result@1.0.0";
  sourceBundleSha256: string;
  decisions: readonly OfficialImmutableArmDecision[];
  captureRecords: readonly unknown[];
  observationPairs: readonly OfficialObservationPair[];
  records: readonly OfficialScoredRecord[];
  replay: OfficialReplayBundle;
  armExecutionCount: 0;
  modelInvocationCount: 0;
  captureRecordCount: 80;
  finalizedPairCount: 40;
  evaluatorRecordCount: 40;
  unblindingPerformed: true;
}>;

export type OfficialSafeRoleFailureRecord = Readonly<{
  schemaVersion: "beyondgreen-official-role-failure-record@1.0.0";
  ordinal: number;
  arm: OfficialArm;
  processPhase: "observer-capture" | "evaluator";
  captureOrdinal: 1 | 2 | null;
  role: OfficialProcessFailure["role"];
  requestId: string | null;
  disposition: "abstain";
  retryAllowed: false;
  errorCode: OfficialProcessFailure["errorCode"];
  failureStage: OfficialProcessFailure["failureStage"];
}>;

/** Project a role failure to the only non-sensitive fields permitted in evidence. */
export function buildOfficialSafeRoleFailureRecord(input: Readonly<{
  ordinal: number;
  arm: OfficialArm;
  processPhase: "observer-capture" | "evaluator";
  captureOrdinal?: 1 | 2;
  failure: OfficialProcessFailure;
}>): OfficialSafeRoleFailureRecord {
  return Object.freeze({
    schemaVersion: "beyondgreen-official-role-failure-record@1.0.0",
    ordinal: input.ordinal,
    arm: input.arm,
    processPhase: input.processPhase,
    captureOrdinal: input.captureOrdinal ?? null,
    role: input.failure.role,
    requestId: input.failure.requestId,
    disposition: input.failure.disposition,
    retryAllowed: input.failure.retryAllowed,
    errorCode: input.failure.errorCode,
    failureStage: input.failure.failureStage,
  });
}

let temporaryOrdinal = 0;

function sha256Bytes(value: Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function isInside(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function sourceRoot(repositoryRoot: string, relativeRoot: string): string {
  if (path.isAbsolute(relativeRoot) || relativeRoot.includes("\\") || relativeRoot.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error("Post-decision source root must be canonical and repository-relative.");
  }
  const repository = realpathSync(repositoryRoot);
  const resolved = path.resolve(repository, ...relativeRoot.split("/"));
  const physical = realpathSync(resolved);
  if (physical !== resolved || !isInside(repository, physical)) {
    throw new Error("Post-decision source root is not a physical directory inside the repository.");
  }
  return physical;
}

function armRecordName(ordinal: number, arm: OfficialArm): string {
  return `${String(ordinal).padStart(2, "0")}-${arm}.json`;
}

function expectedArmRecordPaths(plan: OfficialExecutionPlan): readonly string[] {
  return Object.freeze(plan.slots.flatMap((slot) => ARMS.map((arm) => `arm-records/${armRecordName(slot.ordinal, arm)}`)));
}

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

/**
 * Compare every decision-critical plan field while disclosing the separately
 * validated inventory digest drift caused by the approved verifier repair.
 */
export function assertOfficialPostDecisionPlanCompatibility(
  sourcePlan: OfficialExecutionPlan,
  currentPlan: OfficialExecutionPlan,
): void {
  const { inventorySha256: _sourceInventorySha256, ...sourceDecisionCriticalPlan } = sourcePlan;
  const { inventorySha256: _currentInventorySha256, ...currentDecisionCriticalPlan } = currentPlan;
  if (canonicalJson(sourceDecisionCriticalPlan) !== canonicalJson(currentDecisionCriticalPlan)) {
    throw new Error("Current decision-critical execution plan differs from the RUN-002 source plan.");
  }
}

function buildRecoveryProvenance(
  provenance: Readonly<Record<string, unknown>>,
  disclosure: OfficialPostDecisionInventoryDriftDisclosure,
  sourceInventorySha256: string,
  currentInventorySha256: string,
): Readonly<Record<string, unknown>> {
  if (Sha256Schema.safeParse(disclosure.expectedSourceInventorySha256).success === false
    || Sha256Schema.safeParse(disclosure.expectedCurrentInventorySha256).success === false
    || disclosure.reason !== OFFICIAL_POST_DECISION_INVENTORY_DRIFT_REASON) {
    throw new Error("Post-decision inventory drift disclosure is invalid.");
  }
  if (sourceInventorySha256 !== disclosure.expectedSourceInventorySha256
    || currentInventorySha256 !== disclosure.expectedCurrentInventorySha256) {
    throw new Error("Post-decision inventory hashes differ from the owner-approved disclosure.");
  }
  for (const reserved of ["sourceInventorySha256", "currentInventorySha256", "inventorySha256Match", "inventoryDriftReason"]) {
    if (Object.hasOwn(provenance, reserved)) {
      throw new Error("Post-decision provenance contains a reserved inventory disclosure field.");
    }
  }
  return Object.freeze({
    ...provenance,
    sourceInventorySha256,
    currentInventorySha256,
    inventorySha256Match: sourceInventorySha256 === currentInventorySha256,
    inventoryDriftReason: disclosure.reason,
  });
}

/** Build an exact manifest without reading verifier or candidate content. */
export function buildOfficialPostDecisionSourceManifest(
  repositoryRoot: string,
  relativeSourceRoot: string,
): OfficialPostDecisionSourceManifest {
  const root = sourceRoot(repositoryRoot, relativeSourceRoot);
  const topLevel = readdirSync(root).sort((left, right) => left.localeCompare(right, "en"));
  if (canonicalJson(topLevel) !== canonicalJson(SOURCE_TOP_LEVEL)) {
    throw new Error("Post-decision source root contains an unexpected top-level entry.");
  }
  if (readdirSync(path.join(root, "observer-records")).length !== 0
    || readdirSync(path.join(root, "evaluator-records")).length !== 0) {
    throw new Error("Post-decision source must stop before observer and evaluator records.");
  }
  const plan = OfficialExecutionPlanSchema.parse(readJson(path.join(root, "execution-plan.json")));
  const expectedArmPaths = expectedArmRecordPaths(plan);
  const actualArmPaths = readdirSync(path.join(root, "arm-records"))
    .map((name) => `arm-records/${name}`)
    .sort((left, right) => left.localeCompare(right, "en"));
  if (canonicalJson(actualArmPaths) !== canonicalJson([...expectedArmPaths].sort((left, right) => left.localeCompare(right, "en")))) {
    throw new Error("Post-decision source does not contain the exact 40 arm records.");
  }
  const relativeFiles = [...SOURCE_CONTROL_FILES, ...expectedArmPaths]
    .sort((left, right) => left.localeCompare(right, "en"));
  const files = relativeFiles.map((relativePath) => {
    const bytes = readFileSync(path.join(root, ...relativePath.split("/")));
    return Object.freeze({ path: relativePath, bytes: bytes.length, sha256: sha256Bytes(bytes) });
  });
  return OfficialPostDecisionSourceManifestSchema.parse({
    schemaVersion: "beyondgreen-official-post-decision-source@1.0.0",
    sourceOutputRoot: relativeSourceRoot,
    fileCount: 44,
    armRecordCount: 40,
    totalBytes: files.reduce((total, entry) => total + entry.bytes, 0),
    bundleSha256: sha256CanonicalJson(files),
    files,
  });
}

/** Load and validate all frozen decisions against a separately frozen source manifest. */
export function loadOfficialPostDecisionRecoverySource(input: Readonly<{
  repositoryRoot: string;
  relativeSourceRoot: string;
  sourceManifestPath: string;
}>): OfficialPostDecisionRecoverySource {
  const repository = realpathSync(input.repositoryRoot);
  const manifestPath = path.resolve(repository, ...input.sourceManifestPath.split("/"));
  if (!isInside(repository, manifestPath)) throw new Error("Post-decision source manifest escapes the repository.");
  const manifest = OfficialPostDecisionSourceManifestSchema.parse(readJson(manifestPath));
  if (manifest.sourceOutputRoot !== input.relativeSourceRoot) {
    throw new Error("Post-decision source manifest points at the wrong run.");
  }
  const actual = buildOfficialPostDecisionSourceManifest(input.repositoryRoot, input.relativeSourceRoot);
  if (canonicalJson(actual) !== canonicalJson(manifest)) {
    throw new Error("Post-decision source bytes no longer match the frozen manifest.");
  }
  const root = sourceRoot(repository, input.relativeSourceRoot);
  const plan = OfficialExecutionPlanSchema.parse(readJson(path.join(root, "execution-plan.json")));
  const staticPreflight = readJson(path.join(root, "static-preflight.json")) as Record<string, unknown>;
  if (canonicalJson(staticPreflight.executionPlan) !== canonicalJson(plan)) {
    throw new Error("Post-decision source plan disagrees with static preflight.");
  }
  const runManifest = readJson(path.join(root, "run-manifest.json")) as Record<string, unknown>;
  if (runManifest.evaluationVersion !== "eval-v1.1.0" || runManifest.slotCount !== 20
    || runManifest.totalArmPlans !== 40 || runManifest.syntheticOnly !== false
    || runManifest.createOnce !== true || runManifest.overwriteAllowed !== false || runManifest.deleteAllowed !== false) {
    throw new Error("Post-decision source run manifest violates the frozen official contract.");
  }
  const provenance = readJson(path.join(root, "provenance.json")) as Record<string, unknown>;
  if (provenance.evaluationVersion !== "eval-v1.1.0" || provenance.runOrdinal !== 2
    || provenance.sessionBoundary !== "SES-20260831-033" || provenance.attemptsPerArmCandidate !== 1
    || provenance.retries !== 0) {
    throw new Error("Post-decision source provenance is not RUN-002.");
  }

  const decisions: OfficialImmutableArmDecision[] = [];
  for (const slot of plan.slots) {
    for (const arm of ARMS) {
      const record = ArmRecordSchema.parse(readJson(path.join(root, "arm-records", armRecordName(slot.ordinal, arm))));
      const decision = parseAndFreezeProcessIpc(OfficialImmutableArmDecisionSchema, record.decision);
      const expectedReasoning = arm === "status-quo" ? 0 : 1;
      if (record.ordinal !== slot.ordinal || record.arm !== arm || record.retryCount !== 0
        || record.reasoningInvocationCount !== expectedReasoning
        || record.candidateSha256Before !== slot.candidate.sha256
        || record.candidateSha256After !== slot.candidate.sha256
        || decision.slot.slotId !== slot.slotId || decision.slot.candidateSha256 !== slot.candidate.sha256
        || decision.arm !== arm || decision.inputSha256 !== slot.candidate.sha256 || !decision.immutable) {
        throw new Error("Post-decision arm record is not bound to its frozen slot and attempt.");
      }
      decisions.push(decision);
    }
  }
  if (decisions.length !== 40 || new Set(decisions.map(({ decisionSha256 }) => decisionSha256)).size !== 40) {
    throw new Error("Post-decision source requires 40 unique immutable decisions.");
  }
  return Object.freeze({ manifest, plan, decisions: Object.freeze(decisions) });
}

function atomicCreateFile(filePath: string, contents: string): void {
  if (existsSync(filePath)) throw new Error(`Post-decision writer refuses to overwrite ${path.basename(filePath)}.`);
  temporaryOrdinal += 1;
  const temporaryPath = path.join(path.dirname(filePath), `.create-${process.pid}-${temporaryOrdinal}.tmp`);
  let descriptor: number | undefined;
  try {
    descriptor = openSync(temporaryPath, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600);
    writeFileSync(descriptor, contents, "utf8");
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;
    linkSync(temporaryPath, filePath);
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    if (existsSync(temporaryPath)) unlinkSync(temporaryPath);
  }
}

class OfficialCreateOncePostDecisionWriter {
  readonly #root: string;
  #initialized = false;

  public constructor(repositoryRoot: string, outputRoot: string) {
    const repository = realpathSync(repositoryRoot);
    const resolved = path.resolve(outputRoot);
    if (!isInside(repository, resolved)) throw new Error("Post-decision output root must be a dedicated repository-local directory.");
    this.#root = resolved;
  }

  public initialize(input: Readonly<{
    source: OfficialPostDecisionRecoverySource;
    provenance: unknown;
  }>): void {
    if (this.#initialized) throw new Error("Post-decision writer is already initialized.");
    mkdirSync(path.dirname(this.#root), { recursive: true });
    mkdirSync(this.#root);
    mkdirSync(path.join(this.#root, "observer-records"));
    mkdirSync(path.join(this.#root, "evaluator-records"));
    mkdirSync(path.join(this.#root, "failure-records"));
    atomicCreateFile(path.join(this.#root, "source-manifest.json"), `${canonicalJson(input.source.manifest)}\n`);
    atomicCreateFile(path.join(this.#root, "source-execution-plan.json"), `${canonicalJson(input.source.plan)}\n`);
    atomicCreateFile(path.join(this.#root, "provenance.json"), `${canonicalJson(input.provenance)}\n`);
    atomicCreateFile(path.join(this.#root, "recovery-manifest.json"), `${canonicalJson({
      schemaVersion: "beyondgreen-official-post-decision-recovery@1.0.0",
      evaluationVersion: "eval-v1.1.0",
      sourceOutputRoot: input.source.manifest.sourceOutputRoot,
      sourceBundleSha256: input.source.manifest.bundleSha256,
      sourceArmRecordCount: 40,
      armExecutionCount: 0,
      modelInvocationCount: 0,
      expectedCaptureRecords: 80,
      expectedEvaluatorRecords: 40,
      createOnce: true,
      overwriteAllowed: false,
      deleteAllowed: false,
    })}\n`);
    this.#initialized = true;
  }

  public writeObservationPair(ordinal: number, pair: OfficialObservationPair): void {
    this.#assertInitialized();
    for (const [index, capture] of pair.captures.entries()) {
      const captureOrdinal = index + 1;
      atomicCreateFile(
        path.join(this.#root, "observer-records", `${String(ordinal).padStart(2, "0")}-${pair.arm}-${captureOrdinal}.json`),
        `${canonicalJson({
          schemaVersion: "beyondgreen-official-observer-record@1.0.0",
          captureOrdinal,
          pairSha256: pair.pairSha256,
          capture,
        })}\n`,
      );
    }
  }

  /** Persist only the bounded IPC failure projection; raw errors never enter evidence. */
  public writeRoleFailure(input: Readonly<{
    ordinal: number;
    arm: OfficialArm;
    processPhase: "observer-capture" | "evaluator";
    captureOrdinal?: 1 | 2;
    failure: OfficialProcessFailure;
  }>): void {
    this.#assertInitialized();
    atomicCreateFile(
      path.join(
        this.#root,
        "failure-records",
        `${String(input.ordinal).padStart(2, "0")}-${input.arm}-${input.processPhase}${input.captureOrdinal ? `-${input.captureOrdinal}` : ""}.json`,
      ),
      `${canonicalJson(buildOfficialSafeRoleFailureRecord(input))}\n`,
    );
  }

  public writeEvaluatorRecord(ordinal: number, record: OfficialScoredRecord): void {
    this.#assertInitialized();
    atomicCreateFile(
      path.join(this.#root, "evaluator-records", armRecordName(ordinal, record.arm)),
      `${canonicalJson(record)}\n`,
    );
  }

  public finalize(replay: OfficialReplayBundle): void {
    this.#assertInitialized();
    atomicCreateFile(path.join(this.#root, "aggregate.json"), `${canonicalJson(replay.aggregates)}\n`);
    atomicCreateFile(path.join(this.#root, "report.json"), `${replay.reportJson}\n`);
    atomicCreateFile(path.join(this.#root, "report.html"), replay.reportHtml);
    atomicCreateFile(path.join(this.#root, "offline-replay.jsonl"), `${canonicalJson(replay)}\n`);
  }

  #assertInitialized(): void {
    if (!this.#initialized) throw new Error("Post-decision writer must initialize before evidence writes.");
  }
}

/** Continue only the post-decision stages from an exact, immutable RUN-002 source. */
export async function executeOfficialPostDecisionRecovery(input: Readonly<{
  repositoryRoot: string;
  relativeSourceRoot: string;
  sourceManifestPath: string;
  outputRoot: string;
  provenance: Readonly<Record<string, unknown>>;
  inventoryDriftDisclosure: OfficialPostDecisionInventoryDriftDisclosure;
  hooks: OfficialExecutionHooks;
}>): Promise<OfficialPostDecisionRecoveryResult> {
  const source = loadOfficialPostDecisionRecoverySource(input);
  const currentPreflight = await input.hooks.staticPreflight(input.repositoryRoot);
  assertOfficialPostDecisionPlanCompatibility(source.plan, currentPreflight.executionPlan);
  const recoveryProvenance = buildRecoveryProvenance(
    input.provenance,
    input.inventoryDriftDisclosure,
    source.plan.inventorySha256,
    currentPreflight.executionPlan.inventorySha256,
  );
  for (const slot of source.plan.slots) {
    if (await input.hooks.hashCandidate(slot) !== slot.candidate.sha256) {
      throw new Error("Candidate hash differs from the immutable RUN-002 plan.");
    }
  }

  const writer = new OfficialCreateOncePostDecisionWriter(input.repositoryRoot, input.outputRoot);
  writer.initialize({ source, provenance: recoveryProvenance });
  const gate = await input.hooks.beginPostDecisionEvaluation({
    decisions: source.decisions,
    pairs: Object.freeze([]),
    syntheticOnly: false,
  });
  if (!gate.unblindingPerformed) throw new Error("Post-decision recovery requires the approved unblinding gate.");

  const decisionsBySlot = new Map<string, readonly [OfficialImmutableArmDecision, OfficialImmutableArmDecision]>();
  for (const slot of source.plan.slots) {
    const selected = source.decisions.filter(({ slot: decisionSlot }) => decisionSlot.slotId === slot.slotId);
    if (selected.length !== 2 || selected[0]?.arm !== "status-quo" || selected[1]?.arm !== "beyondgreen") {
      throw new Error("Post-decision source has no ordered decision pair for a slot.");
    }
    decisionsBySlot.set(slot.slotId, Object.freeze([selected[0], selected[1]]));
  }

  const scenarios = new Map<string, OfficialNeutralScenarioEnvelope>();
  for (const slot of source.plan.slots) {
    const processSlot = toOfficialProcessSlot(slot);
    const scenario = parseOfficialNeutralScenario(await input.hooks.releaseNeutralScenario({
      executionSlot: slot,
      slot: processSlot,
      decisions: source.decisions,
    }));
    if (scenario.slot.slotId !== slot.slotId || scenario.decisionSetSha256 !== sha256CanonicalJson(source.decisions)) {
      throw new Error("Recovered neutral scenario is not bound to RUN-002 decisions.");
    }
    scenarios.set(slot.slotId, scenario);
  }

  const captureRecords: unknown[] = [];
  const pairs: OfficialObservationPair[] = [];
  for (const slot of source.plan.slots) {
    const processSlot = toOfficialProcessSlot(slot);
    const slotDecisions = decisionsBySlot.get(slot.slotId)!;
    const scenario = scenarios.get(slot.slotId)!;
    for (const [armIndex, arm] of ARMS.entries()) {
      const captures = [];
      for (const captureOrdinal of [1, 2] as const) {
        try {
          captures.push(await input.hooks.captureObservation({
            executionSlot: slot,
            slot: processSlot,
            arm,
            decisions: slotDecisions,
            scenario,
            captureOrdinal,
          }));
        } catch (error) {
          if (error instanceof OfficialRoleProcessFailureError) {
            writer.writeRoleFailure({ ordinal: slot.ordinal, arm, processPhase: "observer-capture", captureOrdinal, failure: error.failure });
          }
          throw error;
        }
      }
      const pair = finalizeOfficialObservationPair({
        slot: processSlot,
        arm,
        decision: slotDecisions[armIndex]!,
        captures,
      });
      writer.writeObservationPair(slot.ordinal, pair);
      captureRecords.push(parseOfficialObserverCapture(pair.captures[0]), parseOfficialObserverCapture(pair.captures[1]));
      pairs.push(pair);
    }
  }
  if (captureRecords.length !== 80 || pairs.length !== 40) {
    throw new Error("Post-decision recovery requires 80 captures and 40 pairs.");
  }

  const records: OfficialScoredRecord[] = [];
  for (const slot of source.plan.slots) {
    const processSlot = toOfficialProcessSlot(slot);
    const slotDecisions = decisionsBySlot.get(slot.slotId)!;
    for (const arm of ARMS) {
      const pair = pairs.find((entry) => entry.slot.slotId === slot.slotId && entry.arm === arm)!;
      let evaluated: unknown;
      try {
        evaluated = await input.hooks.evaluate({
          executionSlot: slot,
          slot: processSlot,
          arm,
          decisions: slotDecisions,
          observationPair: pair,
        });
      } catch (error) {
        if (error instanceof OfficialRoleProcessFailureError) {
          writer.writeRoleFailure({ ordinal: slot.ordinal, arm, processPhase: "evaluator", failure: error.failure });
        }
        throw error;
      }
      const record = Object.freeze(OfficialScoredRecordSchema.parse(evaluated));
      if (record.fixtureId !== slot.fixtureId || record.candidateId !== slot.candidateId || record.arm !== arm) {
        throw new Error("Recovered evaluator record is bound to the wrong slot or arm.");
      }
      writer.writeEvaluatorRecord(slot.ordinal, record);
      records.push(record);
    }
  }
  const replay = createOfficialReplayBundle(Object.freeze(records));
  const reproduced = replayOfficialBundle(replay);
  if (canonicalJson(reproduced) !== canonicalJson(replay)) throw new Error("Recovered replay does not reproduce exactly.");
  writer.finalize(replay);

  const after = buildOfficialPostDecisionSourceManifest(input.repositoryRoot, input.relativeSourceRoot);
  if (canonicalJson(after) !== canonicalJson(source.manifest)) {
    throw new Error("RUN-002 source bytes changed during post-decision recovery.");
  }
  for (const slot of source.plan.slots) {
    if (await input.hooks.hashCandidate(slot) !== slot.candidate.sha256) {
      throw new Error("Candidate hash changed during post-decision recovery.");
    }
  }
  return Object.freeze({
    schemaVersion: "beyondgreen-official-post-decision-recovery-result@1.0.0",
    sourceBundleSha256: source.manifest.bundleSha256,
    decisions: source.decisions,
    captureRecords: Object.freeze(captureRecords),
    observationPairs: Object.freeze(pairs),
    records: Object.freeze(records),
    replay,
    armExecutionCount: 0,
    modelInvocationCount: 0,
    captureRecordCount: 80,
    finalizedPairCount: 40,
    evaluatorRecordCount: 40,
    unblindingPerformed: true,
  });
}
