import { createClient, RedisClientType } from "redis";
import winston from "winston";
import { logger } from "../infrastructure";

class Redis {
	private static instance: Redis;

	private readonly redisUri: string;

	public client: RedisClientType | null = null;

	constructor(redisUri: string) {
		this.redisUri = redisUri;

		this.createClient();
	}

	private createClient() {
		try {
			this.client = createClient({
				url: this.redisUri,
			});
		} catch (error) {
			winston.error(error);
			this.client = null;
		}
	}

	public async run() {
		try {
			if (this.client) {
				await this.client.connect();
			} else {
				throw new Error("Redis client is not initialized");
			}
		} catch (error) {
			logger.error(error);
		}
	}

	public async stop() {
		try {
			if (this.client) {
				await this.client.disconnect();
			} else {
				logger.warn("Attempted to disconnect a null Redis client");
			}
		} catch (error) {
			logger.error(error);
		}
	}

	public static getInstance(): Redis {
		if (!Redis.instance && process.env.REDIS_URI) {
			Redis.instance = new Redis(process.env.REDIS_URI);
		}
		logger.info(`Starting Redis... [${process.env.REDIS_URI}]`);
		return Redis.instance;
	}
}

export const redis = Redis.getInstance();
