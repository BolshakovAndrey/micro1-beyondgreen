/** Emits aggregate proof that an arm process cannot inspect the BG-H06 verifier package. */
import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const verifierRoot = path.resolve(process.cwd(), "evaluation/verifier-only/BG-H06");
async function denied(operation) {
  try { await operation(); return false; }
  catch (error) { return error?.code === "ERR_ACCESS_DENIED"; }
}
const results = await Promise.all([
  () => readdir(verifierRoot), () => stat(verifierRoot), () => access(verifierRoot),
  () => readFile(path.join(verifierRoot, "ground-truth.json")),
].map(denied));
process.stdout.write(`${JSON.stringify({ allDenied: results.every(Boolean), operationCount: results.length })}\n`);
