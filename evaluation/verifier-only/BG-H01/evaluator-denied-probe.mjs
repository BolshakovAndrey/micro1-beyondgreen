/** Emits aggregate proof that a verifier process cannot inspect candidate source. */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const candidateRoot = path.resolve(process.cwd(), "candidates/BG-H01");
async function denied(operation) { try { await operation(); return { denied: false }; } catch (error) { return { denied: error?.code === "ERR_ACCESS_DENIED" }; } }
const results = await Promise.all([
  () => readdir(candidateRoot), () => stat(candidateRoot),
  () => readFile(path.join(candidateRoot, "candidate-a", "DisplayCardEditor.ts")),
].map(denied));
process.stdout.write(`${JSON.stringify({ allCandidateAccessDenied: results.every((result) => result.denied), operationCount: results.length })}\n`);
