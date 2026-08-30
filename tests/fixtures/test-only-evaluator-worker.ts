/** Runs the test-only verifier worker with only its evaluator-specific engine graph. */
import { runFixtureEvaluatorWorker } from "../../src/d01/worker-runtime.ts";
import { TEST_ONLY_ENGINE } from "./test-only-engine.ts";

const chunks: Buffer[] = [];
for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
const input = Buffer.concat(chunks).toString("utf8");
const launchBindingSha256 = process.argv[3];
if (!launchBindingSha256) throw new Error("TEST-ONLY evaluator launch binding is required.");
const result = await runFixtureEvaluatorWorker(
  TEST_ONLY_ENGINE, process.cwd(), input, process.argv[2], launchBindingSha256,
);
process.stdout.write(`${JSON.stringify(result)}\n`);
