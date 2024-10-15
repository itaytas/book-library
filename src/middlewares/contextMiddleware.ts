import { Request, Response, NextFunction } from "express";
// import { Context } from "../contracts/context";
import { IUserRequest } from "../contracts/request";

export const contextMiddleware = (req: Request, res: Response, next: NextFunction) => {
	// Initialize an empty context
	req.context = {} as IUserRequest;

	// You might want to set some default values or extract from token here
	// For example:
	// if (req.headers.authorization) {
	//   const token = req.headers.authorization.split(' ')[1];
	//   // Verify token and set user and accessToken in context
	// }

	next();
};
