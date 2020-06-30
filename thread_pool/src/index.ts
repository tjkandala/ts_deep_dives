import { Worker, isMainThread, workerData, parentPort } from "worker_threads";

/**
 * attempt at finding a good API for an abstraction
 * layer over Node.js workers.
 *
 * after, implement thread pooling
 */

function typeSafeWorker<T extends (...args: any) => void>(fn: T) {
  console.log("public api called");

  const myWorker = new Worker(
    `
      const {parentPort} = require("worker_threads");
      ${fn.toString()}
      parentPort?.on("message", (val) => {
            ${fn.name}(...val.args);

            parentPort?.postMessage("received");
      });
        `,
    {
      eval: true,
    }
  );

  return async (...args: Parameters<T>) => {
    myWorker.postMessage({
      args,
    });

    return new Promise((resolve) => {
      function cleanup(val: any) {
        if (val === "received") {
          resolve();
          myWorker.off("message", cleanup);
        }
      }

      myWorker.on("message", cleanup);
    });
  };
}

function addTwo(first: number, second: number) {
  console.log(first + second);
}

const coolAddTwo = typeSafeWorker(addTwo);

async function main() {
  await coolAddTwo(1, 2);
  await coolAddTwo(2, 2);

  console.log("complete!");
  process.exit();
}

main();
