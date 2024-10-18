import express, { Application } from "express";
import "dotenv/config";

import { mongoose, redis } from "./dataSource";
import { logger } from "./infrastructure";
import { authMiddleware } from "./middlewares";
import { router } from "./routes";
import { contextMiddleware } from "./middlewares/contextMiddleware";
import { notFoundMiddleware } from "./middlewares/notFoundMiddleware";
import { seedStartupData } from "./scripts/startup";

export async function createServer(): Promise<Application> {
  const app = express();

  // Middleware
  app.use(
    express.json({ limit: "10mb" }),
    express.urlencoded({ limit: "10mb", extended: true }),
    contextMiddleware,
    authMiddleware
  );
  app.use("/api", router);
  app.use(notFoundMiddleware);

//   // Health check route
//   app.get("/", (req, res) => {
//     logger.info("Received a request on /");
//     res.send("Hello, Express with TypeScript and MongoDB!");
//   });

  return app;
}

export async function initializeDataSources() {
  try {
    await mongoose.run();
    if (process.env.NODE_ENV !== "test") {
		await seedStartupData();
	}
    await redis.run();
  } catch (error) {
    logger.error("Error initializing the application:", error);
    throw error;
  }
}

export async function startServer() {
  const PORT = process.env.PORT || 3000;
  
  try {
    await initializeDataSources();
    const app = await createServer();
    
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    return server;
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

