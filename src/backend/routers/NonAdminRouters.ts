import express from "express";
import PasswordResetController from "../controllers/ForgotPasswordController.js";
import ResetPasswordController from "../controllers/ResetPasswordController.js";
import SignUpController from "../controllers/SignUpController.js";
import EmailVerificationController from "../controllers/EmailVerificationController.js";
import GoogleSignInController from "../controllers/GoogleSignInController.js";

const NonAdminRouter = express.Router();

NonAdminRouter.get(
    "/forgot-password",
    PasswordResetController.renderForgotPasswordForm
);

NonAdminRouter.post(
    "/forgot-password",
    PasswordResetController.handleForgotPasswordSubmission
);

NonAdminRouter.get(
    "/reset-password",
    ResetPasswordController.renderResetPasswordForm
);

NonAdminRouter.post(
    "/reset-password",
    ResetPasswordController.handleResetPasswordSubmission
);

NonAdminRouter.get("/signup", SignUpController.renderSignUpForm);

NonAdminRouter.post("/signup", SignUpController.handleSignUpSubmission);

NonAdminRouter.get(
    "/verify-email",
    EmailVerificationController.renderEmailVerificationPage
);

NonAdminRouter.post(
    "/signin-with-gmail",
    GoogleSignInController.SignInWithGmailController
);

export default NonAdminRouter;
