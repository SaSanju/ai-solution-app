import cron from "node-cron";
import { fetchAIContent } from "./service";

cron.schedule("0 0 * * 0", async () => { // Runs every Sunday at midnight
  console.log("Running AI Content Crawler...");
  await fetchAIContent();
  console.log("Crawler Execution Completed");
});
