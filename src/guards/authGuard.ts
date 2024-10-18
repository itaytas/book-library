import { Request, Response, NextFunction } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

import { IContextRequest, IUserRequest } from "../contracts/request";

export const authGuard = {
	isAuth: (req: Request, res: Response, next: NextFunction) => {
		const { user } = (req as IContextRequest<IUserRequest>).context;
		if (user) {
			return next();
		}

		res.status(StatusCodes.UNAUTHORIZED).json({
			message: "[authGuard] user is already authenticated",
			status: StatusCodes.UNAUTHORIZED,
		});
	},

	isGuest: (req: Request, res: Response, next: NextFunction) => {
		const { user } = (req as IContextRequest<IUserRequest>).context;
		if (!user) {
			return next();
		}

		res.status(StatusCodes.FORBIDDEN).json({
			message: ReasonPhrases.FORBIDDEN,
			status: StatusCodes.FORBIDDEN,
		});
	},
};
