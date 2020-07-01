import { Worker, isMainThread, workerData, parentPort } from "worker_threads";

/**
 * sPool library: Easy Type-Safe Thread Pools
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
 * - finally, demonstrate a real-world use-case! (load testing?????)
 *
 * final steps: read all of mraleph, optimize perf
 *
 * References:
 * https://www.codeproject.com/Articles/7933/Smart-Thread-Pool
 * https://www.ibm.com/developerworks/java/library/j-jtp0730/index.html
 *
 * Why?
 *  - I was a little exhausted from constantly code-golfing for front-end libraries. On Node.js libraries,
 *    I can focus on API design and runtime performance, without bundle size getting in the way
 */

/** creates a new sPool worker */
function typeSafeWorker<T extends Callback>(fn: T): AsyncWorker<T> {
  const funcString = fn.toString();

  async function asyncWorker(...args: Parameters<T>) {
    /**
     * TODO: use a worker from the pool. closure referenced variables are a problem here tho. encourage
     * explicit "dependency injection"
     *
     * e.g.
     *
     * const needsDepsFunc = typeSafeWorker(workerFunc);
     * const wrappedFunc = (nonDepsArg) => neepsDepsFunc(nonDepsArg, dep1, dep2)
     *
     * This allows you to use deps from parent thread scope
     */
    const myWorker = new Worker(
      `
          const {parentPort} = require("worker_threads");
          ${funcString}
          parentPort?.on("message", (val) => {

            switch(val.type) {
                case "call": {
                    const data = ${fn.name}(...val.args);
                    parentPort?.postMessage({ status: "received", data });
                    break;
                }

                case "replaceFunc": {
                    break;
                }
            }
          });
            `,
      {
        eval: true,
      }
    );

    myWorker.postMessage({
      type: "call",
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
  const api = {
    kill() {},
    log() {},
  };

  /**
   * returning worker function and "handler interface" as separate elements
   * of a tuple for easy passing-around of function!
   */

  return new Promise<[string, typeof api]>((res) => {
    res(["hi", api]);
  });
}

/**
 * testing
 */

async function main() {
  for (let i = 0; i < 10; i++) {
    await coolAddTwo(i, i + 1);
  }
  await coolAddTwo(20, 22);
  const resd = await coolAddTwo(100, 1);

  console.log("resd is " + resd);

  console.log("complete!");
  //   process.exit();

  const [workerFunc, api] = await initThreadPool(addTwo, 8);
}

main();
