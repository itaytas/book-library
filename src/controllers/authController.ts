import { NextFunction, Request, Response } from "express";
import { startSession } from "mongoose";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { SignInPayload, SignUpPayload } from "../contracts/auth";
import { userService } from "../services";
import { jwtSign } from "../utils/jwt";
import { IBodyRequest, IContextRequest, IUserRequest } from "../contracts/request";
import { createHash } from "../utils/hash";
import { redis } from "../dataSource";
import { logger } from "../infrastructure";

export const authController = {
	signIn: async ({ body: { email, password } }: IBodyRequest<SignInPayload>, res: Response) => {
		try {
			const user = await userService.getByEmail(email);

			const comparePassword = user?.comparePassword(password);
			if (!user || !comparePassword) {
				res.status(StatusCodes.NOT_FOUND).json({
					message: ReasonPhrases.NOT_FOUND,
					status: StatusCodes.NOT_FOUND,
				});
				return;
			}

			const { accessToken } = jwtSign(user.id);
			res.status(StatusCodes.OK).json({
				data: { accessToken },
				message: ReasonPhrases.OK,
				status: StatusCodes.OK,
			});
			return;
		} catch (error) {
			logger.error(error);

			res.status(StatusCodes.BAD_REQUEST).json({
				message: ReasonPhrases.BAD_REQUEST,
				status: StatusCodes.BAD_REQUEST,
			});
			return;
		}
	},

	signUp: async ({ body: { email, password } }: IBodyRequest<SignUpPayload>, res: Response) => {
		try {
			const isUserExist = await userService.isExistByEmail(email);

			if (isUserExist) {
				res.status(StatusCodes.CONFLICT).json({
					message: ReasonPhrases.CONFLICT,
					status: StatusCodes.CONFLICT,
				});
				return;
			}

			const hashedPassword = await createHash(password);

			const user = await userService.create(
				{
					email,
					password: hashedPassword,
				},
			);

			const { accessToken } = jwtSign(user.id);

			res.status(StatusCodes.OK).json({
				data: { accessToken },
				message: ReasonPhrases.OK,
				status: StatusCodes.OK,
			});
			return;
		} catch (error) {
			logger.error(error);
			res.status(StatusCodes.BAD_REQUEST).json({
				message: ReasonPhrases.BAD_REQUEST,
				status: StatusCodes.BAD_REQUEST,
			});
			return;
		}
	},

	signOut: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { user, accessToken } = req.context as IUserRequest;

			if (redis.client) {
				const expiration = Number(process.env.REDIS_TOKEN_EXPIRATION) || 3600; // Default to 1 hour if undefined
				await redis.client.set(`expiredToken:${accessToken}`, `${user._id}`, {
					EX: expiration,
					NX: true,
				});
			} else {
				logger.warn("Redis client is not initialized");
			}

			res.status(StatusCodes.OK).json({
				message: ReasonPhrases.OK,
				status: StatusCodes.OK,
			});
		} catch (error) {
			logger.error(error);
			res.status(StatusCodes.BAD_REQUEST).json({
				message: ReasonPhrases.BAD_REQUEST,
				status: StatusCodes.BAD_REQUEST,
			});
		}
	},
};
