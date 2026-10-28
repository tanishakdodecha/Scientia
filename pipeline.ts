import { loadEnv } from "../src/lib/env";
import { runPipeline } from "../src/lib/pipeline";

loadEnv();

runPipeline()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
