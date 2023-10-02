import express from "express";
import userSchema from "../../schema/authSchema.js";
import { validateBody } from "../../decorators/index.js";
import ctrlAuth from "../../controllers/ctrlAuth.js";
import { authenticate, upload } from "../../middlewars/index.js";

const authRouter = express.Router();

const userSignupSchema = validateBody(userSchema.userSignupSchema);
const userLoginSchema = validateBody(userSchema.loginSignupSchema);
const userRefreshTokenSchema = validateBody(userSchema.userRefreshTokenSchema);
const userEmailSchema = validateBody(userSchema.userEmailSchema);

authRouter.post("/signup", userSignupSchema, ctrlAuth.signup);
authRouter.get("/verify/:verificationToken", ctrlAuth.verify);
authRouter.post("/verify", userEmailSchema, ctrlAuth.resendEmail);
authRouter.post("/login", userLoginSchema, ctrlAuth.login);
authRouter.get("/current", authenticate, ctrlAuth.getCurrent);
authRouter.post("/refresh", userRefreshTokenSchema, ctrlAuth.refresh);
authRouter.post("/logout", authenticate, ctrlAuth.logout);
authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  ctrlAuth.updateAvatar
);
export default authRouter;
