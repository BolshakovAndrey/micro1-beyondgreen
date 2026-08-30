import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const verifierRoot = process.cwd();
const candidateRoot = path.resolve(verifierRoot, "../../../candidates/BG-D01", process.env.BG_CANDIDATE ?? "");
const absentCandidateRoot = path.resolve(verifierRoot, "../../../candidates/BG-D01-absent-control");

async function denied(operation) {
  try {
    await operation();
    return { denied: false, signature: "allowed" };
  }
  catch (error) {
    return {
      denied: error?.code === "ERR_ACCESS_DENIED",
      signature: `${error?.code ?? "unknown"}:${error?.permission ?? "unknown"}`,
    };
  }
}

const candidateOperations = [
  () => readdir(candidateRoot),
  () => stat(candidateRoot),
  () => readFile(path.join(candidateRoot, "MuseumBoard.ts")),
];
const results = await Promise.all(candidateOperations.map(denied));
const existingProbe = await denied(() => stat(candidateRoot));
const absentProbe = await denied(() => stat(absentCandidateRoot));
const verifierReadable = (await readFile(path.join(verifierRoot, "ground-truth.json"), "utf8")).includes("candidate-a");

process.stdout.write(JSON.stringify({
  allCandidateAccessDenied: results.every((result) => result.denied),
  errorProbeIndistinguishable: existingProbe.signature === absentProbe.signature,
  operationCount: results.length,
  verifierReadable,
}));
