import { Worker, isMainThread, workerData, parentPort } from "worker_threads";

/**
 * sPool library
 *
 * attempt at finding a good API for an abstraction
 * layer over Node.js workers.
 *
 * after, implement thread pooling
 *
 * two parts to this library:
 *  1) promisifying functions for worker threads
 *  2) easy thread pools for those functions
 *
 * TODOs:
 * - make it isomorphic! (compat w Web Workers & Node.js Workers)
 * - benchmark against single-threaded versions
 *
 * References:
 * https://www.codeproject.com/Articles/7933/Smart-Thread-Pool
 * https://www.ibm.com/developerworks/java/library/j-jtp0730/index.html
 */

function typeSafeWorker<T extends (...args: any) => any>(
  fn: T
): AsyncWorker<T> {
  console.log("public api called");

  /** creates a new worker */

  return (...args) => {
    const myWorker = new Worker(
      `
          const {parentPort} = require("worker_threads");
          ${fn.toString()}
          parentPort?.on("message", (val) => {
                const data = ${fn.name}(...val.args);
    
                parentPort?.postMessage({ status: "received", data });
          });
            `,
      {
        eval: true,
      }
    );

    myWorker.postMessage({
      args,
    });

    return new Promise<ReturnType<T>>((resolve) => {
      function cleanup(val: any) {
        if (val && val.status === "received") {
          resolve(val.data);
          myWorker.off("message", cleanup);
        }
      }

      myWorker.on("message", cleanup);
    });
  };
}

type AsyncWorker<T extends (...args: any) => any> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>>;

function addTwo(first: number, second: number) {
  console.log(first + second);
  return first + second;
}

const coolAddTwo = typeSafeWorker(addTwo);

async function main() {
  for (let i = 0; i < 10; i++) {
    coolAddTwo(i, i + 1);
  }
  await coolAddTwo(20, 22);
  const resd = await coolAddTwo(100, 1);

  console.log("resd is " + resd);

  console.log("complete!");
  //   process.exit();
}

main();

function initThreadPool() {
  return new Promise((res) => {
    res();
  });
}
