import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSafeDoctorRecord,
  classifyDoctorDetail,
  extractAllowlistedFailedHostname,
  isAllowlistedOfficialHostname,
  redactDiagnosticText,
} from "./doctor-diagnostic.ts";

test("redacts every prohibited identity category before excerpt selection", () => {
  const raw = [
    "/" + "Users" + "/person/work/repo",
    "person" + "@example.test",
    "account" + "_abcd1234",
    "sk-" + "abcdefghijklmnopqrstuvwxyz",
    "hostname=" + "machine-77",
  ].join(" ");
  const result = redactDiagnosticText(raw);
  assert.deepEqual(result.counts, {
    absolute_paths: 1,
    emails: 1,
    account_project_ids: 1,
    tokens_or_secrets: 1,
    machine_identifiers: 1,
  });
  assert.doesNotMatch(result.sanitized, /person|abcd1234|abcdefghijklmnopqrstuvwxyz|machine-77/);
  assert.match(result.sanitized, /<REDACTED_ABSOLUTE_PATH>/);
});

test("extracts only strict official suffix hostnames from DNS failure lines", () => {
  assert.equal(isAllowlistedOfficialHostname("openai.com"), true);
  assert.equal(isAllowlistedOfficialHostname("service.openai.com"), true);
  assert.equal(isAllowlistedOfficialHostname("nested.service.chatgpt.com"), true);
  assert.equal(isAllowlistedOfficialHostname("evilopenai.com"), false);
  assert.equal(isAllowlistedOfficialHostname("service.openai.com:443"), false);
  assert.equal(isAllowlistedOfficialHostname("service.openai.com/path"), false);
  assert.equal(extractAllowlistedFailedHostname("DNS ENOTFOUND service.openai.com"), "service.openai.com");
  assert.equal(extractAllowlistedFailedHostname("DNS ENOTFOUND private.example.test"), null);
  assert.equal(extractAllowlistedFailedHostname("unrelated service.openai.com\nopaque failure"), null);
});

test("distinguishes narrow doctor failure classes", () => {
  assert.equal(classifyDoctorDetail("getaddrinfo ENOTFOUND service").safe_class, "dns");
  assert.equal(classifyDoctorDetail("TLS certificate verify failed").safe_class, "tls");
  assert.equal(classifyDoctorDetail("HTTP 401 unauthorized").safe_class, "http_auth");
  assert.equal(classifyDoctorDetail("HTTP status 503").safe_class, "http");
  assert.equal(classifyDoctorDetail("ECONNREFUSED").safe_class, "connection");
  assert.equal(classifyDoctorDetail("failed to start runtime").safe_class, "startup");
  assert.equal(classifyDoctorDetail("invalid config").safe_class, "configuration");
  assert.equal(classifyDoctorDetail("unknown subcommand doctor").safe_class, "unsupported_doctor_mode");
  assert.equal(classifyDoctorDetail("opaque failure").safe_class, "unknown");
});

test("safe record never contains raw output or an arbitrary excerpt", () => {
  const record = buildSafeDoctorRecord({
    status: 1,
    stdout: "DNS resolution failed at /" + "Users" + "/person/repo",
    stderr: "person" + "@example.test",
  }, 25);
  assert.equal(record.safe_class, "dns");
  assert.equal(record.safe_error_code, "DNS_RESOLUTION");
  assert.equal(record.sanitized_excerpt, null);
  assert.equal(record.raw_output_persisted_or_disclosed, false);
  assert.equal(record.failed_hostname, null);
  assert.doesNotMatch(JSON.stringify(record), /person|example\.test/);
});
