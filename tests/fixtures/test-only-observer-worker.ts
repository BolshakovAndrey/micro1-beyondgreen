/** Runs the test-only candidate observer through the production observation boundary. */
import { runFixtureObservationWorker } from "../../src/d01/worker-runtime.ts";
import { executeFixtureEngineBinding } from "../../src/d01/engine.ts";
import { TEST_ONLY_ENGINE } from "./test-only-engine.ts";

const candidateId = executeFixtureEngineBinding(TEST_ONLY_ENGINE, { kind: "parse_candidate", value: process.argv[2] }) as any;
const captureOrdinal = Number(process.argv[3]);
if (captureOrdinal !== 1 && captureOrdinal !== 2) throw new Error("TEST-ONLY observation ordinal is invalid.");
const arm = executeFixtureEngineBinding(TEST_ONLY_ENGINE, { kind: "parse_arm", value: process.argv[4] }) as any;
const launchBindingSha256 = process.argv[5];
if (!launchBindingSha256) throw new Error("TEST-ONLY observation launch binding is required.");
runFixtureObservationWorker(
  TEST_ONLY_ENGINE, process.cwd(), candidateId, captureOrdinal, arm, launchBindingSha256,
).then((result) => process.stdout.write(`${JSON.stringify(result)}\n`));
