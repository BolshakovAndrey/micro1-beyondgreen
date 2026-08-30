/** Emits aggregate proof that an arm process cannot inspect verifier-only paths. */
import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.cwd(), "evaluation/verifier-only/BG-H04");
async function denied(operation) { try { await operation(); return false; } catch (error) { return error?.code === "ERR_ACCESS_DENIED"; } }
const results = await Promise.all([() => readdir(root), () => stat(root), () => access(root), () => readFile(path.join(root, "ground-truth.json"))].map(denied));
process.stdout.write(`${JSON.stringify({ allDenied: results.every(Boolean), operationCount: results.length })}\n`);
