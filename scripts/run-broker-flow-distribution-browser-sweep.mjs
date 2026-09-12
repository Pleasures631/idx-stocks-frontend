import { runBrokerFlowSweepCli } from "./run-broker-flow-browser-sweep.mjs"

runBrokerFlowSweepCli({
  direction: "DISTRIBUTION",
  commandName: "run-broker-flow-distribution-browser-sweep.mjs",
}).catch((error) => {
  process.stderr.write(`Broker-flow distribution browser sweep gagal: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
