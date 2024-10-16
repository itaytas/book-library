import express, { Request, Response } from "express";
import "dotenv/config";

import { mongoose, redis } from "./dataSource";
import { logger } from "./infrastructure";
import { notFoundMiddleware } from "./middlewares";
import { authMiddleware } from "./middlewares/authMiddleware";
import { router } from "./routes";
import { contextMiddleware } from "./middlewares/contextMiddleware";
import { seedUsers } from "./scripts/startup"; // Import the seeding function

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  express.json({ limit: "10mb" }),
  express.urlencoded({ limit: "10mb", extended: true }),
  // corsMiddleware,
  contextMiddleware,
  authMiddleware,
  router,
  notFoundMiddleware
);

// Run MongoDB and Redis, then seed users
(async () => {
  try {
    await mongoose.run();
    await seedUsers(); // Seed users after the database connection is established
    redis.run();
  } catch (error) {
    logger.error("Error initializing the application:", error);
    process.exit(1); // Exit if there is an error during initialization
  }
})();

// Routes
app.get("/", (req: Request, res: Response) => {
  logger.info("Received a request on /");
  res.send("Hello, Express with TypeScript and MongoDB!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
