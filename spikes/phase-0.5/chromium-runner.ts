#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";

export const CARD_COUNT = 300;
export const WARMUPS_PER_ARM = 5;
export const MEASURED_SAMPLES_PER_ARM = 30;
export const ACTION_LOG = Object.freeze([
  "mount", "select-all", "allocate-1x2", "step-3", "allocate-3x2",
  "select-every-third", "remove-3x1", "reset",
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function expectedSnapshots() {
  const ids = Array.from({ length: CARD_COUNT }, (_, index) => `MVG-${String(index + 1).padStart(3, "0")}`);
  const all = [ ...ids ];
  const thirds = ids.filter((_, index) => (index + 1) % 3 === 0);
  const values = (regular, everyThird = regular) => ids.map((_, index) => (index + 1) % 3 === 0 ? everyThird : regular);
  return [
    { action: "mount", ordered_ids: ids, values: values(0), selection_ids: [], step: 1 },
    { action: "select-all", ordered_ids: ids, values: values(0), selection_ids: all, step: 1 },
    { action: "allocate-1x2", ordered_ids: ids, values: values(2), selection_ids: all, step: 1 },
    { action: "step-3", ordered_ids: ids, values: values(2), selection_ids: all, step: 3 },
    { action: "allocate-3x2", ordered_ids: ids, values: values(8), selection_ids: all, step: 3 },
    { action: "select-every-third", ordered_ids: ids, values: values(8), selection_ids: thirds, step: 3 },
    { action: "remove-3x1", ordered_ids: ids, values: values(8, 5), selection_ids: thirds, step: 3 },
    { action: "reset", ordered_ids: ids, values: values(0), selection_ids: [], step: 1 },
  ];
}

export function summarize(values) {
  const sorted = [ ...values ].sort((a, b) => a - b);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
  return {
    count: values.length,
    min: sorted[0],
    max: sorted.at(-1),
    mean,
    median: sorted[Math.floor(sorted.length / 2)],
    p95: sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)],
    standard_deviation: Math.sqrt(variance),
    coefficient_of_variation: mean === 0 ? 0 : Math.sqrt(variance) / mean,
  };
}

export function measuredOrder() {
  return [
    ...Array.from({ length: 15 }, () => [ "baseline", "advanced" ]).flat(),
    ...Array.from({ length: 15 }, () => [ "advanced", "baseline" ]).flat(),
  ];
}

class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.waiters = [];
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result);
        return;
      }
      for (const waiter of [ ...this.waiters ]) {
        if (waiter.method === message.method && (!waiter.sessionId || waiter.sessionId === message.sessionId)) {
          this.waiters.splice(this.waiters.indexOf(waiter), 1);
          waiter.resolve(message.params);
        }
      }
      this.onEvent?.(message);
    });
  }

  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    return new CdpClient(socket);
  }

  send(method, params = {}, sessionId = undefined) {
    const id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  wait(method, sessionId) {
    return new Promise((resolve) => this.waiters.push({ method, sessionId, resolve }));
  }

  close() { this.socket.close(); }
}

function taskDuration(metrics) {
  return metrics.metrics.find((metric) => metric.name === "TaskDuration")?.value ?? 0;
}

function validateResult(result) {
  const expected = expectedSnapshots();
  return result.card_count === CARD_COUNT && result.error_count === 0 && result.reset_pass === true &&
    JSON.stringify(result.action_log) === JSON.stringify(ACTION_LOG) &&
    JSON.stringify(result.snapshots) === JSON.stringify(expected) &&
    result.final_values.length === CARD_COUNT && result.final_values.every((value) => value === 0) &&
    result.final_selection_ids.length === 0;
}

async function launchBrowser(root) {
  mkdirSync(path.join(root, "tmp"), { recursive: true });
  const profile = mkdtempSync(path.join(root, "tmp/chromium-profile-"));
  const candidates = process.platform === "darwin"
    ? [ "chromium", "google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]
    : [ "chromium", "google-chrome", "google-chrome-stable" ];
  for (const command of candidates) {
    const child = spawn(command, [
      "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
      "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
      "--disable-sync", "--disable-default-apps", "--disable-extensions", "about:blank",
    ], { stdio: [ "ignore", "ignore", "pipe" ] });
    let stderr = "";
    const outcome = await new Promise((resolve) => {
      const timer = setTimeout(() => resolve({ kind: "timeout" }), 10_000);
      child.once("error", (error) => { clearTimeout(timer); resolve({ kind: "error", code: error.code }); });
      child.once("exit", (code) => { clearTimeout(timer); resolve({ kind: "exit", code }); });
      child.stderr.on("data", (chunk) => {
        stderr += chunk;
        const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (match) { clearTimeout(timer); resolve({ kind: "ready", url: match[1] }); }
      });
    });
    if (outcome.kind === "ready") return { child, profile, debuggerUrl: outcome.url };
    if (!child.killed) child.kill("SIGTERM");
  }
  rmSync(profile, { recursive: true, force: true });
  throw Object.assign(new Error("No approved system Chromium command was available."), { code: "CHROMIUM_UNAVAILABLE" });
}

function environmentSummary() {
  const ramGiB = os.totalmem() / (1024 ** 3);
  return {
    os_family: process.platform,
    os_major: os.release().split(".")[0],
    cpu_architecture: os.arch(),
    logical_core_count: os.cpus().length,
    rounded_ram_bucket: ramGiB < 8 ? "under_8_gib" : ramGiB < 16 ? "8_to_15_gib" : ramGiB < 32 ? "16_to_31_gib" : "32_gib_or_more",
  };
}

async function runSample(client, root, arm) {
  const { targetId } = await client.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await client.send("Target.attachToTarget", { targetId, flatten: true });
  let consoleErrors = 0;
  let unhandledExceptions = 0;
  client.onEvent = (message) => {
    if (message.sessionId !== sessionId) return;
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") consoleErrors += 1;
    if (message.method === "Runtime.exceptionThrown") unhandledExceptions += 1;
  };
  await client.send("Page.enable", {}, sessionId);
  await client.send("Runtime.enable", {}, sessionId);
  await client.send("Performance.enable", {}, sessionId);
  const loaded = client.wait("Page.loadEventFired", sessionId);
  const url = `${pathToFileURL(path.join(root, "spikes/phase-0.5/chromium-board.html")).href}?arm=${arm}`;
  await client.send("Page.navigate", { url }, sessionId);
  await loaded;
  const before = await client.send("Performance.getMetrics", {}, sessionId);
  const evaluated = await client.send("Runtime.evaluate", {
    expression: "window.runProtocol()",
    awaitPromise: true,
    returnByValue: true,
  }, sessionId);
  const after = await client.send("Performance.getMetrics", {}, sessionId);
  const result = evaluated.result?.value;
  await client.send("Target.closeTarget", { targetId });
  return {
    arm,
    correctness_pass: Boolean(result && validateResult(result) && consoleErrors === 0 && unhandledExceptions === 0),
    observable_sha256: result ? sha256(JSON.stringify({ snapshots: result.snapshots, action_log: result.action_log, action_log_sha256: result.action_log_sha256, reset_pass: result.reset_pass })) : null,
    action_log_sha256: result?.action_log_sha256 ?? null,
    board_render_count: result?.board_render_count ?? null,
    total_card_render_count: result?.total_card_render_count ?? null,
    task_duration_delta_ms: (taskDuration(after) - taskDuration(before)) * 1000,
    console_error_count: consoleErrors,
    unhandled_exception_count: unhandledExceptions,
  };
}

async function main() {
  const root = path.resolve(import.meta.dirname, "../..");
  let browser;
  try {
    browser = await launchBrowser(root);
    const client = await CdpClient.connect(browser.debuggerUrl);
    const version = await client.send("Browser.getVersion");
    const warmups = [];
    for (let index = 0; index < WARMUPS_PER_ARM; index += 1) {
      warmups.push(await runSample(client, root, "baseline"));
      warmups.push(await runSample(client, root, "advanced"));
    }
    const measurements = [];
    for (const arm of measuredOrder()) measurements.push(await runSample(client, root, arm));
    client.close();

    const allRuns = [ ...warmups, ...measurements ];
    const correctnessPass = allRuns.every((sample) => sample.correctness_pass) && new Set(allRuns.map((sample) => sample.observable_sha256)).size === 1;
    const evidence = {
      schema_version: "beyondgreen-chromium-spike@1.1.0",
      status: correctnessPass ? "passed" : "failed_correctness_gate",
      scenario: "independent_synthetic_museum_visit_group_allocation_board",
      chromium_version: version.product,
      protocol_version: version.protocolVersion,
      environment: environmentSummary(),
      synthetic_card_count: CARD_COUNT,
      warmups_per_arm: WARMUPS_PER_ARM,
      measured_samples_per_arm: MEASURED_SAMPLES_PER_ARM,
      measured_order: "15_baseline_advanced_pairs_then_15_advanced_baseline_pairs",
      measured_samples: measurements.map((sample, index) => ({
        sequence: index + 1,
        arm: sample.arm,
        correctness_pass: sample.correctness_pass,
        observable_sha256: sample.observable_sha256,
        action_log_sha256: sample.action_log_sha256,
        userland_board_render_count: sample.board_render_count,
        userland_total_card_render_count: sample.total_card_render_count,
        cdp_task_duration_delta_ms: sample.task_duration_delta_ms,
        console_error_count: sample.console_error_count,
        unhandled_exception_count: sample.unhandled_exception_count,
      })),
      correctness: {
        passed: correctnessPass,
        all_300_values_after_each_action_verified: allRuns.every((sample) => sample.correctness_pass),
        selection_ids_verified: allRuns.every((sample) => sample.correctness_pass),
        action_log_and_digest_verified: allRuns.every((sample) => sample.action_log_sha256 !== null),
        reset_verified: allRuns.every((sample) => sample.correctness_pass),
        console_errors: allRuns.reduce((sum, sample) => sum + sample.console_error_count, 0),
        unhandled_exceptions: allRuns.reduce((sum, sample) => sum + sample.unhandled_exception_count, 0),
        identical_observable_digest: new Set(allRuns.map((sample) => sample.observable_sha256)).size === 1 ? allRuns[0].observable_sha256 : null,
        action_log_sha256: new Set(allRuns.map((sample) => sample.action_log_sha256)).size === 1 ? allRuns[0].action_log_sha256 : null,
      },
      performance_claim_allowed: correctnessPass,
      metrics: correctnessPass ? Object.fromEntries([ "baseline", "advanced" ].map((arm) => {
        const rows = measurements.filter((sample) => sample.arm === arm);
        return [ arm, {
          userland_board_render_count: summarize(rows.map((sample) => sample.board_render_count)),
          userland_total_card_render_count: summarize(rows.map((sample) => sample.total_card_render_count)),
          cdp_task_duration_delta_ms: summarize(rows.map((sample) => sample.task_duration_delta_ms)),
        } ];
      })) : null,
      react_profiler_used: false,
      raw_browser_output_persisted_or_disclosed: false,
      browser_profile: "fresh_temporary_headless_profile_removed_after_run",
    };
    writeFileSync(path.join(root, "artifacts/phase-0.5-chromium-spike.json"), `${JSON.stringify(evidence, null, 2)}\n`);
    process.stdout.write(`${JSON.stringify({ status: evidence.status, chromium_version: evidence.chromium_version, correctness: evidence.correctness, performance_claim_allowed: evidence.performance_claim_allowed, metrics: evidence.metrics })}\n`);
    process.exitCode = correctnessPass ? 0 : 1;
  }
  catch (error) {
    const evidence = {
      schema_version: "beyondgreen-chromium-spike@1.1.0",
      status: "blocked",
      safe_error_code: error?.code ?? "CHROMIUM_SPIKE_FAILURE",
      raw_browser_output_persisted_or_disclosed: false,
      performance_claim_allowed: false,
    };
    writeFileSync(path.join(path.resolve(import.meta.dirname, "../.."), "artifacts/phase-0.5-chromium-spike.json"), `${JSON.stringify(evidence, null, 2)}\n`);
    process.stdout.write(`${JSON.stringify(evidence)}\n`);
    process.exitCode = 1;
  }
  finally {
    if (browser) {
      if (browser.child.exitCode === null) {
        browser.child.kill("SIGTERM");
        await new Promise((resolve) => {
          const timer = setTimeout(resolve, 5_000);
          browser.child.once("exit", () => { clearTimeout(timer); resolve(); });
        });
      }
      rmSync(browser.profile, { recursive: true, force: true });
    }
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  await main();
}
