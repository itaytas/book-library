import { Router } from "express";

import { authController } from "../controllers";
import { authGuard } from "../guards";
import { authValidation } from "../validations";

export const auth = (router: Router): void => {
	router.post("/auth/sign-in", authGuard.isGuest, authValidation.signIn, authController.signIn);

	router.post("/auth/sign-up", authGuard.isGuest, authValidation.signUp, authController.signUp);

	router.get("/auth/sign-out", authGuard.isAuth, authController.signOut);
};
