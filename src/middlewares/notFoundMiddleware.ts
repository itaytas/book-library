import { NextFunction, Request, Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
	res.status(StatusCodes.NOT_FOUND).json({ message: ReasonPhrases.NOT_FOUND, status: StatusCodes.NOT_FOUND });
};
