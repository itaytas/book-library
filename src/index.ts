import express, { Request, Response } from "express";
import "dotenv/config";

import { mongoose } from "./dataSource";
import { logger } from "./infrastructure";
import { notFoundMiddleware } from "./middlewares";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
	express.json({ limit: "10mb" }),
	express.urlencoded({ limit: "10mb", extended: true }),
	// corsMiddleware,
	// authMiddleware,
	// router,
	notFoundMiddleware
);

mongoose.run();

// Routes
app.get("/", (req: Request, res: Response) => {
	logger.info("Received a request on /");
	res.send("Hello, Express with TypeScript and MongoDB!");
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
