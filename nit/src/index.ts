/**
 * Building Git
 *
 * TODO:
 * - Configure tests. Mock the filesystem.
 * - Don't forget to (somehow) use Worker Threads and Child Processes!
 * - Include benchmarks! There's not really any context for them, however.
 */

const path = process.cwd();

const arg = process.argv[2];

if (arg == null) {
  console.error("You didn't provide a path argument");
  process.exit();
}

switch (arg) {
  case "hi":
    console.log("hi to you too!");
    break;

  default:
    console.log(arg);
}
