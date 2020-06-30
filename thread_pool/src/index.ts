import { Worker, isMainThread, workerData, parentPort } from "worker_threads";

/**
 * attempt at finding a good API for an abstraction
 * layer over Node.js workers.
 *
 * after, implement thread pooling
 *
 * two parts to this library:
 *  1) promisifying functions for worker threads
 *  2) easy thread pools for those functions
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

    /** this is kind of gnarly! pls fix the listener leak */
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
  for (let i = 0; i < 10; i++) {
    coolAddTwo(i, i + 1);
  }
  await coolAddTwo(20, 22);
  await coolAddTwo(100, 1);

  console.log("complete!");
  //   process.exit();
}

main();
