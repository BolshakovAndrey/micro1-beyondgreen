#!/usr/bin/env node

import dns from "node:dns/promises";
import https from "node:https";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ALLOWLISTED_HOSTS = Object.freeze([
  "chatgpt.com",
  "auth.openai.com",
  "api.openai.com",
]);

export function elapsedBucket(milliseconds) {
  if (milliseconds < 250) return "under_250ms";
  if (milliseconds < 1_000) return "250_to_999ms";
  if (milliseconds <= 3_000) return "1_to_3s";
  return "over_3s";
}

export function safeNetworkErrorClass(code, phase) {
  if ([ "ENOTFOUND", "EAI_AGAIN", "ENODATA" ].includes(code)) {
    return code === "EAI_AGAIN" ? "dns_temporary_failure" : "dns_not_found";
  }
  if ([ "ETIMEDOUT", "ESOCKETTIMEDOUT" ].includes(code)) return `${phase}_timeout`;
  if (/^(?:CERT_|ERR_TLS_|DEPTH_ZERO_|UNABLE_TO_|SELF_SIGNED_)/.test(code ?? "")) return "tls_certificate";
  if ([ "ECONNREFUSED", "ECONNRESET", "EHOSTUNREACH", "ENETUNREACH" ].includes(code)) return "connection_failure";
  return `${phase}_unknown`;
}

export function httpStatusClass(statusCode) {
  if (!Number.isInteger(statusCode)) return "none";
  if (statusCode >= 200 && statusCode < 300) return "2xx";
  if (statusCode >= 300 && statusCode < 400) return "3xx";
  if (statusCode >= 400 && statusCode < 500) return "4xx";
  if (statusCode >= 500 && statusCode < 600) return "5xx";
  return "other";
}

async function dnsProbe(hostname) {
  const started = Date.now();
  try {
    await dns.lookup(hostname);
    return { pass: true, error_class: "none", elapsed_bucket: elapsedBucket(Date.now() - started) };
  }
  catch (error) {
    return {
      pass: false,
      error_class: safeNetworkErrorClass(error?.code, "dns"),
      elapsed_bucket: elapsedBucket(Date.now() - started),
    };
  }
}

function httpsProbe(hostname) {
  return new Promise((resolve) => {
    const started = Date.now();
    let tlsConnected = false;
    const request = https.request({ hostname, method: "HEAD", path: "/", timeout: 5_000 }, (response) => {
      response.resume();
      resolve({
        tls_connect: tlsConnected,
        error_class: "none",
        http_status_class: httpStatusClass(response.statusCode),
        elapsed_bucket: elapsedBucket(Date.now() - started),
      });
    });
    request.on("socket", (socket) => socket.once("secureConnect", () => { tlsConnected = true; }));
    request.on("timeout", () => request.destroy(Object.assign(new Error("timeout"), { code: "ETIMEDOUT" })));
    request.on("error", (error) => resolve({
      tls_connect: tlsConnected,
      error_class: safeNetworkErrorClass(error?.code, tlsConnected ? "https" : "tls_connect"),
      http_status_class: "none",
      elapsed_bucket: elapsedBucket(Date.now() - started),
    }));
    request.end();
  });
}

export function interpretMatrix(rows) {
  if (rows.every((row) => !row.dns_pass)) return "local_resolver_or_environment_issue";
  const failedDns = rows.filter((row) => !row.dns_pass);
  if (failedDns.length > 0) return "host_specific_dns_or_filter_issue";
  if (rows.some((row) => !row.tls_connect || row.https_error_class !== "none")) return "transport_or_policy_issue_after_dns";
  return "public_service_reachability_passed";
}

export async function runNetworkMatrix(root) {
  const rows = [];
  for (const hostname of ALLOWLISTED_HOSTS) {
    const dnsResult = await dnsProbe(hostname);
    const httpsResult = dnsResult.pass
      ? await httpsProbe(hostname)
      : { tls_connect: false, error_class: "not_attempted_after_dns_failure", http_status_class: "none", elapsed_bucket: "not_attempted" };
    rows.push({
      hostname,
      dns_pass: dnsResult.pass,
      dns_error_class: dnsResult.error_class,
      dns_elapsed_bucket: dnsResult.elapsed_bucket,
      tls_connect: httpsResult.tls_connect,
      https_error_class: httpsResult.error_class,
      http_status_class: httpsResult.http_status_class,
      https_elapsed_bucket: httpsResult.elapsed_bucket,
    });
  }
  const matrix = {
    schema_version: "beyondgreen-network-diagnostic@1.0.0",
    completed_at_utc: new Date().toISOString(),
    allowed_hosts_only: true,
    credentials_used: false,
    resolved_ips_persisted_or_disclosed: false,
    headers_cookies_or_bodies_persisted_or_disclosed: false,
    model_or_agent_invocations: 0,
    rows,
    interpretation: interpretMatrix(rows),
  };
  const evidencePath = path.join(root, "artifacts/phase-0.5-cli-diagnostics.json");
  const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
  evidence.reachability_matrix = matrix;
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  return matrix;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = path.resolve(import.meta.dirname, "../..");
  process.stdout.write(`${JSON.stringify(await runNetworkMatrix(root))}\n`);
}
