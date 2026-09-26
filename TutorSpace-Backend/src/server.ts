import app from "./app.js";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 5000;

/**
 * Entry point for both environments.
 *
 * Locally this listens on a port, as before. On Vercel the file is built into a
 * single serverless function, and there is nothing to listen on — the platform
 * invokes the exported app as the request handler. So the listen call is guarded
 * and the app is also exported as the default export.
 *
 * `prisma.$connect()` is likewise only awaited locally: in a serverless function
 * the first query connects lazily, and blocking the module's top level on a
 * database round trip would add that latency to every cold start.
 */
async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to database successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("An error occurred:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// `VERCEL` is set in every Vercel build and runtime environment.
if (!process.env.VERCEL) {
  main();
}

export default app;
