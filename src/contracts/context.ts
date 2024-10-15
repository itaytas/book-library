import { IUserRequest } from "./request";

export interface Context {
	user?: IUserRequest;
	accessToken?: string;
}
