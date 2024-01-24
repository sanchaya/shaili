import { Request, Response } from "express";
import * as crypto from "crypto";
import Users from "../db/models/Users.js";
import PasswordResetTokens from "../db/models/PasswordResetTokens.js";
import edge from "../../common/EdgeConfig.js";
import MailerService from "../../common/MailerService.js";

export const renderForgotPasswordForm = async (
    _req: Request,
    res: Response
) => {
    const html = await edge.render("Pages::ForgotPassword");
    res.send(html);
};

export const handleForgotPasswordSubmission = async (
    req: Request,
    res: Response
) => {
    const email = req.body.email;
    const user = await Users.findOne({ where: { email: email } });

    if (!user) {
        res.status(404).send({
            statusCode: 404,
            message: `No account with that email address exists.`,
        });
    } else {
        const token = crypto.randomBytes(20).toString("hex");
        const currentDate = new Date();
        const expires = new Date(
            currentDate.getTime() +
                parseInt(process.env.PASSWORD_RESET_EXPIRATION_TIME!, 10) *
                    60000
        );

        const url = `${
            process.env.BASE_URL
        }/reset-password/?key=${token}&expires=${expires.getTime()}`;

        const oldToken = await PasswordResetTokens.findOne({
            where: { email: email },
        });

        if (oldToken) {
            await PasswordResetTokens.update(
                { token: token },
                { where: { email } }
            );
        } else {
            await PasswordResetTokens.create({ email, token });
        }

        const mailHtml = await edge.render("Templates::ForgotPasswordEmail", {
            email: user.email,
            url: url,
        });
        const mailOptions = {
            to: user.email,
            from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
            subject: "Password Reset",
            html: mailHtml,
        };

        await MailerService.sendMail(mailOptions);

        res.status(200).send({
            statusCode: 200,
            message: `An e-mail has been sent to ${user.email} with further instructions.`,
        });
    }
};

export default {
    renderForgotPasswordForm,
    handleForgotPasswordSubmission,
};
