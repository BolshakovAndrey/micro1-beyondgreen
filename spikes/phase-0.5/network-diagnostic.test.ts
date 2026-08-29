import assert from "node:assert/strict";
import test from "node:test";

import {
  ALLOWLISTED_HOSTS,
  elapsedBucket,
  httpStatusClass,
  interpretMatrix,
  safeNetworkErrorClass,
} from "./network-diagnostic.ts";

test("host allowlist is exact and contains no URL path", () => {
  assert.deepEqual(ALLOWLISTED_HOSTS, [ "chatgpt.com", "auth.openai.com", "api.openai.com" ]);
  assert.equal(ALLOWLISTED_HOSTS.every((host) => !host.includes("/") && !host.includes("?")), true);
});

test("safe classes and buckets contain no raw network identity", () => {
  assert.equal(safeNetworkErrorClass("ENOTFOUND", "dns"), "dns_not_found");
  assert.equal(safeNetworkErrorClass("EAI_AGAIN", "dns"), "dns_temporary_failure");
  assert.equal(safeNetworkErrorClass("CERT_HAS_EXPIRED", "tls"), "tls_certificate");
  assert.equal(safeNetworkErrorClass("ECONNREFUSED", "tls_connect"), "connection_failure");
  assert.equal(elapsedBucket(10), "under_250ms");
  assert.equal(elapsedBucket(500), "250_to_999ms");
  assert.equal(elapsedBucket(2_000), "1_to_3s");
  assert.equal(elapsedBucket(4_000), "over_3s");
  assert.equal(httpStatusClass(204), "2xx");
  assert.equal(httpStatusClass(302), "3xx");
  assert.equal(httpStatusClass(401), "4xx");
  assert.equal(httpStatusClass(503), "5xx");
});

test("matrix interpretation distinguishes resolver, host, and transport failures", () => {
  const dnsFail = (hostname) => ({ hostname, dns_pass: false, tls_connect: false, https_error_class: "not_attempted_after_dns_failure" });
  const pass = (hostname) => ({ hostname, dns_pass: true, tls_connect: true, https_error_class: "none" });
  assert.equal(interpretMatrix(ALLOWLISTED_HOSTS.map(dnsFail)), "local_resolver_or_environment_issue");
  assert.equal(interpretMatrix([ pass(ALLOWLISTED_HOSTS[0]), dnsFail(ALLOWLISTED_HOSTS[1]), pass(ALLOWLISTED_HOSTS[2]) ]), "host_specific_dns_or_filter_issue");
  assert.equal(interpretMatrix([ pass(ALLOWLISTED_HOSTS[0]), { ...pass(ALLOWLISTED_HOSTS[1]), tls_connect: false, https_error_class: "connection_failure" }, pass(ALLOWLISTED_HOSTS[2]) ]), "transport_or_policy_issue_after_dns");
  assert.equal(interpretMatrix(ALLOWLISTED_HOSTS.map(pass)), "public_service_reachability_passed");
});
