import { createHash } from "node:crypto";
import { access, lstat, readFile, readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const verifierTarget = path.resolve(process.cwd(), "../../verifier-only");
const absentPeer = path.resolve(process.cwd(), "../../verifier-absent-control");
const parentTarget = path.dirname(process.cwd());
const candidateTarget = path.resolve(
  process.cwd(),
  "../../../candidates/BG-D01",
  process.env.BG_CANDIDATE,
  "MuseumBoard.ts",
);

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

const operations = {
  enumerate: () => readdir(verifierTarget),
  read: () => readFile(path.join(verifierTarget, "BG-D01", "ground-truth.json")),
  hash: async () => createHash("sha256").update(await readFile(path.join(verifierTarget, "BG-D01", "ground-truth.json"))).digest("hex"),
  stat: () => stat(verifierTarget),
  lstat: () => lstat(verifierTarget),
  access: () => access(verifierTarget),
  realpath: () => realpath(verifierTarget),
  enumerateParent: () => readdir(parentTarget),
};

const results = Object.fromEntries(
  await Promise.all(Object.entries(operations).map(async ([name, operation]) => [name, await denied(operation)])),
);
const existingProbe = await denied(() => stat(verifierTarget));
const absentProbe = await denied(() => stat(absentPeer));
let candidateReadable = false;
let candidateExecutable = false;
try {
  candidateReadable = (await readFile(candidateTarget, "utf8")).includes("export const MuseumBoard");
  const [{ MuseumBoard }, { mountMuseumBoard }] = await Promise.all([
    import(pathToFileURL(candidateTarget).href),
    import("./harness.ts"),
  ]);
  const board = await mountMuseumBoard(MuseumBoard);
  candidateExecutable = board.observe().cardIds.length === 300;
  await board.dispose();
}
catch {
  candidateReadable = false;
  candidateExecutable = false;
}

process.stdout.write(JSON.stringify({
  allDenied: Object.values(results).every((result) => result.denied),
  candidateExecutable,
  candidateReadable,
  errorProbeIndistinguishable: existingProbe.signature === absentProbe.signature,
  operationCount: Object.keys(results).length,
}));
