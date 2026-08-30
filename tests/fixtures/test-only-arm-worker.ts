/** Runs the test-only arm worker through the production injected worker runtime. */
import { runFixtureArmWorker } from "../../src/d01/worker-runtime.ts";
import { executeFixtureEngineBinding } from "../../src/d01/engine.ts";
import { TEST_ONLY_ENGINE } from "./test-only-engine.ts";

const arm = executeFixtureEngineBinding(TEST_ONLY_ENGINE, { kind: "parse_arm", value: process.argv[2] }) as any;
const candidateId = executeFixtureEngineBinding(TEST_ONLY_ENGINE, { kind: "parse_candidate", value: process.argv[3] }) as any;
const launchBindingSha256 = process.argv[4];
if (!launchBindingSha256) throw new Error("TEST-ONLY arm launch binding is required.");
runFixtureArmWorker(TEST_ONLY_ENGINE, process.cwd(), arm, candidateId, launchBindingSha256).then((result) => {
  process.stdout.write(`${JSON.stringify(result)}\n`);
});
