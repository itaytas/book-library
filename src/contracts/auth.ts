import { IUser } from "./user";

export type SignInPayload = Pick<IUser, "email" | "password">;

export type SignUpPayload = Pick<IUser, "email" | "password" | "role" |  "firstName" | "lastName">;
