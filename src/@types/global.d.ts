
declare namespace Express {
	import { IUserRequest } from "../contracts/request";
	interface Request {
		context: IUserRequest;
	}
}

declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: string;
		APP_PORT: number;
		APP_URL: string;
		CLIENT_URL: string;
		MONGODB_URI: string;
		REDIS_URI: string;
		REDIS_TOKEN_EXPIRATION: number;
		JWT_SECRET: string;
		JWT_EXPIRATION: string;
	}
}



