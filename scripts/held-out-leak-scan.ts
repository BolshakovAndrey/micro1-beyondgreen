/** Fails closed if arm-visible or candidate source exposes verifier-only mapping data. */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

function filesUnder(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const entry = path.join(root, name);
    return statSync(entry).isDirectory() ? filesUnder(entry) : [entry];
  });
}

const forbidden = [/ground[-_]truth/i, /verifier[-_]only/i, /preserving.*candidate/i, /false[-_ ]green.*candidate/i];
const files = [
  ...filesUnder("candidates").filter((file) => /BG-H0[1-6]/.test(file)),
  ...filesUnder("evaluation/arm-visible").filter((file) =>
    /BG-H0[1-6]/.test(file) && !/(?:denied-probe\.mjs|isolation\.test\.ts)$/.test(file)
  ),
];
for (const file of files) {
  const source = readFileSync(file, "utf8");
  if (forbidden.some((pattern) => pattern.test(source))) throw new Error(`Verifier mapping leak marker in ${file}`);
}
process.stdout.write(`HELD_OUT_ORACLE_LEAK_SCAN_PASSED files=${files.length}\n`);
