import { Worker, isMainThread, workerData, parentPort } from "worker_threads";

/**
 * sPool library: Isomorphic Thread Pools
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
 * - make it isomorphic! (compat w Web Workers & Node.js Workers)? optional
 * - benchmark against single-threaded versions
 * - error handling (check stack trace)
 * - abortable
 * - use SharedArrayBuffer!
 *
 * final steps: read all of mraleph, optimize perf
 *
 * References:
 * https://www.codeproject.com/Articles/7933/Smart-Thread-Pool
 * https://www.ibm.com/developerworks/java/library/j-jtp0730/index.html
 */

function typeSafeWorker<T extends Callback>(fn: T): AsyncWorker<T> {
  /** creates a new worker */

  async function asyncWorker(...args: Parameters<T>) {
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
  }

  asyncWorker.kill = "hi";

  return asyncWorker;
}

type AsyncWorker<T extends Callback> = {
  (...args: Parameters<T>): Promise<ReturnType<T>>;
  kill: string;
};

type Callback = (...args: any) => any;

function addTwo(first: number, second: number) {
  console.log(first + second);
  return first + second;
}

const coolAddTwo = typeSafeWorker(addTwo);

function initThreadPool(fn: Callback, threads: number) {
  return new Promise<[any, () => void]>((res) => {
    res(["hi", function kill() {}]);
  });
}

/**
 * testing
 */

async function main() {
  for (let i = 0; i < 10; i++) {
    coolAddTwo(i, i + 1);
  }
  await coolAddTwo(20, 22);
  const resd = await coolAddTwo(100, 1);

  console.log("resd is " + resd);

  console.log("complete!");
  //   process.exit();

  const [workerFunc, kill] = await initThreadPool(addTwo, 8);
}

main();
