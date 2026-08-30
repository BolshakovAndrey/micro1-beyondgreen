/** Emits aggregate proof that an arm-visible process cannot inspect verifier-only files. */
import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const verifierRoot = path.resolve(process.cwd(), "evaluation/verifier-only");
const absentRoot = path.resolve(process.cwd(), "evaluation/verifier-only-absent-control");
async function denied(operation) {
  try { await operation(); return { denied: false, signature: "allowed" }; }
  catch (error) { return { denied: error?.code === "ERR_ACCESS_DENIED", signature: `${error?.code ?? "unknown"}:${error?.permission ?? "unknown"}` }; }
}
const operations = {
  enumerate: () => readdir(verifierRoot),
  read: () => readFile(path.join(verifierRoot, "BG-H01", "ground-truth.json")),
  stat: () => stat(verifierRoot),
  access: () => access(verifierRoot),
};
const results = Object.fromEntries(await Promise.all(Object.entries(operations).map(async ([name, operation]) => [name, await denied(operation)])));
const existing = await denied(() => stat(verifierRoot));
const absent = await denied(() => stat(absentRoot));
process.stdout.write(`${JSON.stringify({ allDenied: Object.values(results).every((result) => result.denied), errorProbeIndistinguishable: existing.signature === absent.signature, operationCount: Object.keys(results).length })}\n`);
