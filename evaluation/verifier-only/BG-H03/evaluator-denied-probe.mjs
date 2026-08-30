/** Emits aggregate proof that an evaluator process cannot inspect candidate bytes. */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.cwd(), "candidates/BG-H03");
async function denied(operation) { try { await operation(); return false; } catch (error) { return error?.code === "ERR_ACCESS_DENIED"; } }
const results = await Promise.all([() => readdir(root), () => stat(root), () => readFile(path.join(root, "candidate-a", "SeedLibrarySelectionDesk.ts"))].map(denied));
process.stdout.write(`${JSON.stringify({ allDenied: results.every(Boolean), operationCount: results.length })}\n`);
