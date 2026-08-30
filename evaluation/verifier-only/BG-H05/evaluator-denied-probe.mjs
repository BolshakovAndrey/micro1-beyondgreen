/** Emits aggregate proof that a verifier process cannot inspect BG-H05 candidate sources. */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
const candidateRoot = path.resolve(process.cwd(), "candidates/BG-H05");
async function denied(operation) { try { await operation(); return false; } catch (error) { return error?.code === "ERR_ACCESS_DENIED"; } }
const results = await Promise.all([() => readdir(candidateRoot), () => stat(candidateRoot), () => readFile(path.join(candidateRoot, "candidate-a", "UnitReadout.ts"))].map(denied));
process.stdout.write(`${JSON.stringify({ allDenied: results.every(Boolean), operationCount: results.length })}\n`);
