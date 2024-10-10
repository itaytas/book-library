import { createLogger, format, transports } from "winston";

export const logger = createLogger({
	format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), format.json()),
	transports: [
		new transports.File({ filename: process.env.API_LOG_FILENAME || "app.log" }),
		new transports.Console(),
	],
});
