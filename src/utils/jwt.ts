import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";

import { IAccessToken, IJwtUser } from "../contracts/jwt";

export const jwtSign = (id: ObjectId): IAccessToken => {
	const jwtSecret = process.env.JWT_SECRET;
	if (!jwtSecret) {
		throw new Error("JWT_SECRET is not defined in environment variables");
	}

	const accessToken = jwt.sign({ id }, jwtSecret, {
		expiresIn: process.env.JWT_EXPIRATION || "1h", // Provide a default expiration
	});

	return { accessToken };
};

export const jwtVerify = ({ accessToken }: { accessToken: string }): IJwtUser => {
	const jwtSecret = process.env.JWT_SECRET;
	if (!jwtSecret) {
		throw new Error("JWT_SECRET is not defined in environment variables");
	}

	const decoded = jwt.verify(accessToken, jwtSecret) as jwt.JwtPayload;

	if (typeof decoded === "object" && "id" in decoded) {
		return { id: decoded.id } as IJwtUser;
	}

	throw new Error("Invalid token payload");
};
