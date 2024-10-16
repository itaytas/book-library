import { ClientSession, ObjectId } from "mongoose";

import { User } from "../models";

export const userService = {
	create: ({ email, password }: { email: string; password: string }) =>
		new User({
			email,
			password,
		}).save(),

	getById: (userId: ObjectId) => User.findById(userId),

	getByEmail: (email: string) => User.findOne({ email }),

	isExistByEmail: (email: string) => User.exists({ email }),

	updateProfileByUserId: (
		userId: ObjectId,
		{ firstName, lastName }: { firstName: string; lastName: string },
		session?: ClientSession
	) => {
		const data = [{ _id: userId }, { firstName, lastName }];

		let params = null;

		if (session) {
			params = [...data, { session }];
		} else {
			params = data;
		}

		return User.updateOne(...params);
	},

	updateEmailByUserId: (userId: ObjectId, email: string, session?: ClientSession) => {
		const data = [{ _id: userId }, { email }];

		let params = null;

		if (session) {
			params = [...data, { session }];
		} else {
			params = data;
		}

		return User.updateOne(...params);
	},

	deleteById: (userId: ObjectId, session?: ClientSession) => User.deleteOne({ user: userId }, { session }),
};
