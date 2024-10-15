import { Request, Response, NextFunction } from "express";
import validator from "validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { SignInPayload, SignUpPayload } from "../contracts/auth";
import { IBodyRequest } from "../contracts/request";
import { logger } from "../infrastructure";

export const authValidation = {
	signIn: (req: Request, res: Response, next: NextFunction) => {
		try {
			const body = (req as IBodyRequest<SignInPayload>).body;

			if (!body.email || !body.password) {
				res.status(StatusCodes.BAD_REQUEST).json({
					message: ReasonPhrases.BAD_REQUEST,
					status: StatusCodes.BAD_REQUEST,
				});
				return;
			}

			let normalizedEmail = body.email && validator.normalizeEmail(body.email);
			if (normalizedEmail) {
				normalizedEmail = validator.trim(normalizedEmail);
			}

			if (!normalizedEmail || !validator.isEmail(normalizedEmail, { allow_utf8_local_part: false })) {
				res.status(StatusCodes.BAD_REQUEST).json({
					message: ReasonPhrases.BAD_REQUEST,
					status: StatusCodes.BAD_REQUEST,
				});
				return;
			}

			Object.assign(body, { email: normalizedEmail });

			next();
		} catch (error) {
			logger.error(error);

			res.status(StatusCodes.BAD_REQUEST).json({
				message: ReasonPhrases.BAD_REQUEST,
				status: StatusCodes.BAD_REQUEST,
			});
		}
	},

	signUp: (req: Request, res: Response, next: NextFunction) => {
		try {
			const body = (req as IBodyRequest<SignUpPayload>).body;
			if (!body.email || !body.password || !validator.isLength(body.password, { min: 6, max: 48 })) {
				res.status(StatusCodes.BAD_REQUEST).json({
					message: ReasonPhrases.BAD_REQUEST,
					status: StatusCodes.BAD_REQUEST,
				});
				return;
			}

			let normalizedEmail = body.email && validator.normalizeEmail(body.email);
			if (normalizedEmail) {
				normalizedEmail = validator.trim(normalizedEmail);
			}

			if (!normalizedEmail || !validator.isEmail(normalizedEmail, { allow_utf8_local_part: false })) {
				res.status(StatusCodes.BAD_REQUEST).json({
					message: ReasonPhrases.BAD_REQUEST,
					status: StatusCodes.BAD_REQUEST,
				});
				return;
			}

			Object.assign(body, { email: normalizedEmail });
			
			next();
		} catch (error) {
			logger.error(error);

			res.status(StatusCodes.BAD_REQUEST).json({
				message: ReasonPhrases.BAD_REQUEST,
				status: StatusCodes.BAD_REQUEST,
			});
		}
	},
};
