/** Emits only aggregate proof that a verifier process cannot inspect candidate sources. */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const candidateRoot = path.resolve(process.cwd(), "candidates/BG-D02");
async function denied(operation) {
  try { await operation(); return { denied: false }; }
  catch (error) { return { denied: error?.code === "ERR_ACCESS_DENIED" }; }
}
const results = await Promise.all([() => readdir(candidateRoot), () => stat(candidateRoot), () => readFile(path.join(candidateRoot, "candidate-a", "ParcelDispatchBoard.ts"))].map(denied));
process.stdout.write(`${JSON.stringify({ allCandidateAccessDenied: results.every((result) => result.denied), operationCount: results.length })}\n`);
