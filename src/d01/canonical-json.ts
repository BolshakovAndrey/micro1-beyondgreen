/** Supplies deterministic JSON, hashing, and deep-freezing primitives for evidence binding. */
import { createHash } from "node:crypto";

/** Serialize JSON-compatible evidence with recursively sorted object keys. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => (
    `${JSON.stringify(key)}:${canonicalJson(record[key])}`
  )).join(",")}}`;
}

/** Return a lowercase SHA-256 digest for text or bytes. */
export function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Recursively freeze an evidence value before it crosses the evaluator gate. */
export function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}
