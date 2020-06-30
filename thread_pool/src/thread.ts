import { worker } from "cluster";
import { workerData } from "worker_threads";

console.log("im the thread!");

console.log(workerData);
