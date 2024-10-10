import { connect, connection } from "mongoose";
import { logger } from "../infrastructure";

export const mongoose = {
	run: async () => {
        try {
            logger.info(`Starting Mongo... [${process.env.MONGODB_URI}]`);
			return await connect(process.env.MONGODB_URI || "");
		} catch (error) {
			logger.error(error);
		}
	},

	stop: async () => {
        try {
            logger.info(`Stopping Mongo... [${process.env.MONGODB_URI}]`);
			return await connection.destroy();
		} catch (error) {
			logger.error(error);
		}
	},
};
