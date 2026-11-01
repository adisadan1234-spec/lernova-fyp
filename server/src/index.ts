import "dotenv/config";

import { createApp } from "./app.js";
import { readEnvironment } from "./config.js";

const environment = readEnvironment(process.env);
const app = createApp({ clientOrigin: environment.CLIENT_ORIGIN });

const server = app.listen(environment.PORT, () => {
  console.log(`Lernova API listening on http://localhost:${environment.PORT}`);
});

function shutDown(signal: string) {
  console.log(`${signal} received; closing the Lernova API.`);
  server.close((error) => {
    if (error) {
      console.error("The Lernova API did not close cleanly.", error);
      process.exitCode = 1;
      return;
    }

    process.exitCode = 0;
  });
}

process.on("SIGINT", () => shutDown("SIGINT"));
process.on("SIGTERM", () => shutDown("SIGTERM"));
