import { Worker, isMainThread, workerData } from "worker_threads";

/**
 * attempt at finding a good API for an abstraction
 * layer over Node.js workers.
 */

console.log(isMainThread);

console.log(workerData?.count);

if (workerData && workerData.count > 10) {
  console.log("end of workers");

  process.exit();
}

const myWorker = new Worker(__filename, {
  workerData: { count: isMainThread ? 1 : workerData.count + 1 },
});
