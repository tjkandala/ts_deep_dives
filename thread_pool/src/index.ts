import { Worker, isMainThread, workerData, parentPort } from "worker_threads";
import { cpus } from "os";

/**
 * sPool library: Easy Type-Safe Worker Thread Pools
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
 * - solve dining philosophers problem in sPool! the only node solution I found uses clusters, not workers!
 *
 * NOTEs:
 * - don't make an overloaded main function! separate api for function and for files... wait nvm. might be more elegant to overload
 * - cool perks! no syncronization needed bc no shared address space/memory
 *
 * final steps: read all of mraleph, optimize perf
 *
 * References:
 * https://www.ibm.com/developerworks/java/library/j-jtp0730/index.html
 *
 * Why?
 *  - I was a little exhausted from constantly code-golfing for front-end libraries. On Node.js libraries,
 *    I can focus on API design and runtime performance, without bundle size getting in the way
 */

type AsyncStub<T extends Callback> = {
  (...args: Parameters<T>): Promise<ReturnType<T>>;
  kill: string;
};

type Callback = (...args: any) => any;

/** creates a new sPool worker */
function typeSafeWorker<T extends Callback>(fn: T): AsyncStub<T> {
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
      function cleanup(val: { status: string; data: ReturnType<T> }) {
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

function addTwo(first: number, second: number) {
  console.log(first + second);
  return first + second;
}

const coolAddTwo = typeSafeWorker(addTwo);

/**
 *
 * thread pool init should return the worker creation function!!
 * this is a better design choice because the worker fn depends on
 * the existence of + reference to the thread pool!
 *
 * The "worker factory" returns "client stub" functions
 *
 * @param fn
 * @param threads
 */

async function initThreadPool(fn: Callback, threads?: number) {
  if (false) {
    const err = new Error("A thread pool already exists!");
    err.name = "MultipleThreadPoolError";
    throw err;
  }

  // this is a 2-core/4-thread processor, cpus().length is returning 4
  // seems it is accounting for hyperthreaded cpus
  if (threads == null) threads = cpus().length + 1;

  const pool = {
    kill() {},
    log() {},
  };

  let nextId = 0;
  /** associate function for creation worker to an incrementing id */
  const functionMap = new Map<Callback, number>();

  function createWorker(fn: Callback) {
    functionMap.set(fn, nextId++);
  }

  async function* workQueue() {
    yield 12;
    yield "tj";
  }

  const asyncGenWQ = workQueue();

  /**
   * don't forget to keep track of thread ids!
   *
   *
   * also, functions should be associated with an id by reference (map/weakmap?).
   * when the stub for an id is called, send "call" message to a worker along with
   * stringified function and args!
   *
   * make a module-global variable to keep track of whether a thread pool has been
   * created already! throw exception if user tries to create multiple thread pools (that makes no sense, bad for perf)
   */

  /**
   * returning worker function and "handle interface" as separate elements
   * of a tuple for easy passing-around of function!
   */

  return new Promise<[typeof createWorker, typeof pool]>(async (res) => {
    res([createWorker, pool]);
    // after resolving promise, kick off work queue.. evaluate this approach further
    for await (const val of asyncGenWQ) {
      // nvm, check if this blocks initial return..
      console.log(val);
    }
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

  const [workerFunc, api] = await initThreadPool(addTwo, 8);
}

main();
