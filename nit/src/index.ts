import {} from "fs";
import {} from "path";

/**
 * Building Git
 *
 * TODO:
 * - Configure tests. Mock the filesystem.
 * - Don't forget to (somehow) use Worker Threads and Child Processes! Think about how to parallelize
 * - Include benchmarks! There's not really any context/comparison for them, however.
 */
async function main() {
  const path = process.cwd();

  const arg = process.argv[2];

  console.log(__filename);

  const fullPath = "";
  console.log(fullPath);

  if (arg == null) {
    console.error("You didn't provide a path argument");
    process.exit();
  }

  switch (arg) {
    case "hi":
      console.log("hi to you too!");
      break;

    case "yo":
      console.log("yo mama");
      break;

    default:
      console.log(arg);
  }

  console.log(path);
}

main();
