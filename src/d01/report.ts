/** Builds deterministic, schema-validated JSON and escaped static HTML evidence artifacts. */
import { canonicalJson, sha256 } from "./canonical-json.ts";
import { D01EvidenceSchema, type ArmDecision, type D01Evidence, type EvaluatorResult } from "./schemas.ts";

function escapeHtml(value: unknown): string {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function list(values: readonly string[]): string {
  return values.length === 0 ? "<p>None.</p>" : `<ul>${values.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`;
}

function armSection(label: string, decision: ArmDecision, evaluator: EvaluatorResult): string {
  const gate = decision.legacyGate;
  const risks = decision.riskInventory?.risks ?? [];
  const probes = decision.probePlan?.probes ?? [];
  const checks = decision.internalChecks?.checks ?? [];
  const counterexample = decision.internalChecks?.counterexample ?? null;
  return `<section><h2>${escapeHtml(label)}</h2>
<dl><dt>Verdict</dt><dd>${escapeHtml(decision.verdict)}</dd><dt>Typed reason</dt><dd>${escapeHtml(decision.reasonCode)}</dd><dt>Evidence complete</dt><dd>${escapeHtml(decision.evidenceComplete)}</dd>
<dt>Rationale</dt><dd>${escapeHtml(decision.rationale)}</dd><dt>Decision SHA-256</dt><dd><code>${escapeHtml(sha256(canonicalJson(decision)))}</code></dd>
<dt>Abstain/error class</dt><dd>${escapeHtml(decision.operationalError?.errorClass ?? "none")}</dd></dl>
<h3>Frozen legacy gate</h3>
<p>Compilation: ${escapeHtml(gate.compileStatus)}; passed=${escapeHtml(gate.compilePassed)}. Visible tests: ${escapeHtml(gate.visibleStatus)}; passed=${escapeHtml(gate.visiblePassed)}.</p>
<p>Exact five IDs: ${gate.visibleTestIds.map((id) => `<code>${escapeHtml(id)}</code>`).join(", ")}</p>
<h4>Compile diagnostics</h4>${list(gate.compileDiagnostics)}
<h4>Deterministic assertion failures</h4>${list(gate.deterministicAssertionFailures)}
<h4>Operational failures</h4>${list(gate.operationalFailures)}
<h3>Risk inventory</h3>
${risks.length === 0 ? "<p>Not available.</p>" : `<table><thead><tr><th>ID</th><th>Category</th><th>Status</th><th>Structural evidence</th></tr></thead><tbody>${risks.map((risk) => `<tr><td>${escapeHtml(risk.id)}</td><td>${escapeHtml(risk.category)}</td><td>${escapeHtml(risk.status)}</td><td>${escapeHtml(risk.evidence)}</td></tr>`).join("")}</tbody></table>`}
<h3>Oracle-free ProbePlan and outcomes</h3>
${probes.length === 0 ? "<p>Not applicable or unavailable.</p>" : `<table><thead><tr><th>Probe</th><th>Arm-visible contract</th><th>Outcome</th></tr></thead><tbody>${probes.map((probe) => {
    const check = checks.find((item) => item.probeId === probe.id);
    return `<tr><td>${escapeHtml(probe.id)}</td><td>${escapeHtml(probe.armVisibleContract)}</td><td>${escapeHtml(check ? (check.passed ? "passed" : "failed") : "missing")}</td></tr>`;
  }).join("")}</tbody></table>`}
<h3>Bounded divergence counterexample</h3>
${counterexample ? `<p>${escapeHtml(counterexample.summary)}</p><table><thead><tr><th>ID</th><th>Expected</th><th>Actual</th></tr></thead><tbody>${counterexample.differingItems.map((item) => `<tr><td>${escapeHtml(item.id)}</td><td>${escapeHtml(item.expected)}</td><td>${escapeHtml(item.actual)}</td></tr>`).join("")}</tbody></table><p>Bounded to ${escapeHtml(counterexample.boundedTo)} items; omitted differing items=${escapeHtml(counterexample.omittedDifferingItemCount)}.</p>` : "<p>No divergence observed.</p>"}
<h3>Post-decision independent evaluator</h3>
<p>Membership=${escapeHtml(evaluator.membership)}; oracle accepted candidate=${escapeHtml(evaluator.oracleAcceptedCandidate)}; completed decision=${escapeHtml(evaluator.completedDecision)}; correct decision=${escapeHtml(evaluator.correctDecision)}; reason-correct reject=${escapeHtml(evaluator.reasonCorrectReject)}; false alarm=${escapeHtml(evaluator.falseAlarm)}; evaluated after finalization=${escapeHtml(evaluator.evaluatedAfterDecision)}; pre-decision feedback rounds=${escapeHtml(evaluator.feedbackRoundsBeforeDecision)}.</p></section>`;
}

/** Validate D01 JSON evidence before returning its stable pretty-printed form. */
export function serializeEvidence(input: unknown): string {
  const evidence = D01EvidenceSchema.parse(input);
  return `${JSON.stringify(evidence, null, 2)}\n`;
}

/** Generate a server-free reviewer report only from schema-validated, escaped evidence. */
export function renderEvidenceHtml(input: unknown): string {
  const evidence = D01EvidenceSchema.parse(input);
  const replay = evidence.replayIdentity;
  const jsonDigest = sha256(canonicalJson(evidence));
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>BG-D01 verification evidence</title>
<style>body{font:16px/1.5 system-ui;max-width:1080px;margin:40px auto;padding:0 20px;color:#18211b}table{border-collapse:collapse;width:100%}th,td{border:1px solid #9aaba0;padding:8px;text-align:left;vertical-align:top}code{overflow-wrap:anywhere}.notice{background:#fff4d6;padding:14px;border-left:4px solid #a56a00}dt{font-weight:700}dd{margin:0 0 8px}</style></head>
<body><h1>BG-D01 unscored verification evidence</h1>
<p class="notice">Development demonstration only. This is not an official or scored run, and its replay is approved synthetic/offline evidence rather than a live model result.</p>
<h2>Candidate identity and immutability</h2><dl><dt>Candidate</dt><dd>${escapeHtml(evidence.candidateId)}</dd>
<dt>Repository path</dt><dd><code>${escapeHtml(evidence.candidate.relativePath)}</code></dd><dt>SHA-256 before</dt><dd><code>${escapeHtml(evidence.candidate.sha256Before)}</code></dd>
<dt>SHA-256 after</dt><dd><code>${escapeHtml(evidence.candidate.sha256After)}</code></dd><dt>Unchanged</dt><dd>${escapeHtml(evidence.candidate.unchanged)}</dd></dl>
${armSection("Status quo", evidence.decisions.statusQuo.decision, evidence.evaluatorResults.statusQuo)}
${armSection("BeyondGreen", evidence.decisions.beyondGreen.decision, evidence.evaluatorResults.beyondGreen)}
<h2>Oracle boundary and measured execution</h2><p>Claims derived from measured events=${escapeHtml(evidence.oracleBoundary.derivedFromMeasuredEvents)}; physical process isolation=${escapeHtml(evidence.oracleBoundary.physicalProcessIsolation)}; K=${escapeHtml(evidence.oracleBoundary.k)}; arm verifier access=${escapeHtml(evidence.oracleBoundary.armProcessesCouldReadVerifierOnly)}; evaluators started only after both immutable decisions=${escapeHtml(evidence.oracleBoundary.evaluatorStartedAfterBothDecisions)}; candidate executed inside oracle process=${escapeHtml(evidence.oracleBoundary.candidateExecutedInsideOracleProcess)}; network egress denied=${escapeHtml(evidence.oracleBoundary.networkEgressDenied)}; host PATH inherited=${escapeHtml(evidence.oracleBoundary.hostPathInherited)}.</p>
<p>Started=${escapeHtml(evidence.timing.startedAtUtc)}; ended=${escapeHtml(evidence.timing.endedAtUtc)}; measured duration=${escapeHtml(evidence.timing.durationMs)} ms; membership=${escapeHtml(evidence.membership)}.</p>
<table><thead><tr><th>Sequence</th><th>Measured ms</th><th>Event</th><th>Arm</th><th>Execution slot</th><th>Decision SHA-256</th><th>Capability</th></tr></thead><tbody>${evidence.executionEvents.map((event) => `<tr><td>${escapeHtml(event.sequence)}</td><td>${escapeHtml(event.monotonicMs)}</td><td>${escapeHtml(event.kind)}</td><td>${escapeHtml(event.arm ?? "run")}</td><td>${escapeHtml(event.executionSlot ?? "run")}</td><td><code>${escapeHtml(event.decisionSha256 ?? "not_finalized")}</code></td><td>${escapeHtml(event.capabilityProfile)}</td></tr>`).join("")}</tbody></table>
<h3>Runner-produced capability evidence</h3>
<table><thead><tr><th>Execution slot</th><th>Role</th><th>Profile</th><th>Launch binding</th><th>Process identity SHA-256</th><th>Sandbox policy</th><th>Path policy</th><th>Proof SHA-256</th></tr></thead><tbody>${evidence.capabilityProofs.map((proof) => `<tr><td>${escapeHtml(proof.worker.executionSlot)}</td><td>${escapeHtml(proof.worker.role)}</td><td>${escapeHtml(proof.worker.capabilityProfile)}</td><td><code>${escapeHtml(proof.worker.launchBindingSha256)}</code></td><td><code>${escapeHtml(proof.worker.processIdentitySha256)}</code></td><td><code>${escapeHtml(proof.launch.sandboxPolicySha256)}</code></td><td><code>${escapeHtml(proof.launch.allowedReadPathsSha256)}</code></td><td><code>${escapeHtml(proof.proofSha256)}</code></td></tr>`).join("")}</tbody></table>
<h2>Manifests and digests</h2><dl><dt>Arm-visible manifest</dt><dd><code>${escapeHtml(evidence.armVisibleManifestSha256)}</code></dd><dt>Verifier-only manifest</dt><dd><code>${escapeHtml(evidence.verifierOnlyManifestSha256)}</code></dd><dt>Validated JSON evidence</dt><dd><code>${escapeHtml(jsonDigest)}</code></dd></dl>
<h2>Offline replay identity</h2>${replay ? `<dl><dt>Protocol</dt><dd>${escapeHtml(replay.protocol)}</dd><dt>Schema</dt><dd>${escapeHtml(replay.schemaVersion)}</dd><dt>Records</dt><dd>${escapeHtml(replay.recordCount)}</dd><dt>Replay SHA-256</dt><dd><code>${escapeHtml(replay.replaySha256)}</code></dd><dt>Final chain SHA-256</dt><dd><code>${escapeHtml(replay.finalChainSha256)}</code></dd><dt>Final output SHA-256</dt><dd><code>${escapeHtml(replay.finalOutputSha256)}</code></dd></dl>` : "<p>Unavailable because the arm abstained before trustworthy reasoning evidence was produced.</p>"}
<h2>Resources and limitations</h2><dl><dt>Runtime</dt><dd>${escapeHtml(evidence.resources.runtime)}</dd><dt>Reasoning engine</dt><dd>${escapeHtml(evidence.resources.reasoningEngine)}</dd><dt>Adapter</dt><dd>${escapeHtml(evidence.resources.reasoningAdapter)}</dd><dt>Model status</dt><dd>${escapeHtml(evidence.resources.modelStatus)}</dd><dt>Live adapter</dt><dd>${escapeHtml(evidence.resources.liveAdapterStatus)}</dd><dt>Model invocations</dt><dd>${escapeHtml(evidence.resources.modelInvocationCount)}</dd><dt>Billing</dt><dd>${escapeHtml(evidence.resources.billing)}</dd><dt>Per-run USD</dt><dd>${escapeHtml(evidence.resources.monetaryCost)}</dd><dt>Per-arm deadline</dt><dd>${escapeHtml(evidence.resources.timeoutSeconds)} seconds independently for each arm (${escapeHtml(evidence.resources.engineBudgetSeconds)} engine + ${escapeHtml(evidence.resources.finalizationReserveSeconds)} finalization reserve); shared across arms=${escapeHtml(evidence.resources.sharedDeadlineAcrossArms)}</dd></dl>
${list(evidence.limitations)}</body></html>\n`;
}

/** Return both validated report representations and their deterministic digests. */
export function buildReportArtifacts(input: unknown): Readonly<{
  evidence: D01Evidence; json: string; html: string; canonicalJsonSha256: string; htmlSha256: string;
}> {
  const evidence = D01EvidenceSchema.parse(input);
  const json = serializeEvidence(evidence);
  const html = renderEvidenceHtml(evidence);
  return Object.freeze({
    evidence, json, html, canonicalJsonSha256: sha256(canonicalJson(evidence)), htmlSha256: sha256(html),
  });
}
