import { Worker, isMainThread, workerData } from "worker_threads";

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
  function wrapper() {
    fn(workerData.args);
  }

  return [
    (...args: Parameters<T>) => {
      const myWorker = new Worker(__dirname + "/thread.js", {
        workerData: { args },
      });
    },
  ];
}

function addTwo(first: number, second: number) {
  console.log(first + second);
}

const [coolAddTwo] = typeSafeWorker(addTwo);

coolAddTwo(1, 2);
