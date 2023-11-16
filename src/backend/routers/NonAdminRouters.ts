import express from "express";
import PasswordResetController from "../controllers/ForgotPasswordController.js";
import ResetPasswordController from "../controllers/ResetPasswordController.js";

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

export default NonAdminRouter;
