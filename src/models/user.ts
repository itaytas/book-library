import { Schema, model } from "mongoose";
import { compareSync } from "bcrypt";

import { IUser, IUserMethods, UserModel, UserRole } from "../contracts/user";

const schema = new Schema<IUser, UserModel, IUserMethods>(
	{
		email: String,
		password: String,
		firstName: String,
		lastName: String,
		role: String
	},
	{ timestamps: true }
);

schema.methods.comparePassword = function (password: string) {
	return compareSync(password, this.password);
};

schema.methods.toJSON = function () {
	const obj = this.toObject();
	delete obj.password;
	return obj;
};

export const User = model<IUser, UserModel>("User", schema);
