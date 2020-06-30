import { Worker, isMainThread, workerData, parentPort } from "worker_threads";

/**
 * attempt at finding a good API for an abstraction
 * layer over Node.js workers.
 *
 * after, implement thread pooling
 */

// const myWorker = new Worker(__filename, {
//   workerData: { count: isMainThread ? 1 : workerData.count + 1 },
// });

function typeSafeWorker<T extends (...args: any) => void>(fn: T) {
  const myWorker = new Worker(
    `
    const {parentPort} = require("worker_threads");
    console.log("meep");
    ${fn.toString()}
    parentPort?.on("message", (val) => {
          ${fn.name}(...val.args)
          process.exit()
    });
      `,
    {
      eval: true,
    }
  );

  return [
    (...args: Parameters<T>) => {
      console.log("public api called");
      myWorker.postMessage({
        args,
      });
    },
  ];
}

function addTwo(first: number, second: number) {
  console.log(first + second);
}

const [coolAddTwo] = typeSafeWorker(addTwo);

coolAddTwo(1, 2);
coolAddTwo(2, 2);
