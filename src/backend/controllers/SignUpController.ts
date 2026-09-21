import { Request, Response } from "express";
import edge from "../../common/EdgeConfig.js";
import Users from "../db/models/Users.js";
import * as crypto from "crypto";
import * as argon2 from "argon2";
import MailerService from "../../common/MailerService.js";

export const renderSignUpForm = async (req: Request, res: Response) => {
    const html = await edge.render("Pages::SignUp");
    res.send(html);
};

export const handleSignUpSubmission = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body as {
        name: string;
        email: string;
        password: string;
        role: number;
    };

    // Validate role - only allow specific roles for self-registration
    const allowedRoles = [2, 3, 4, 5]; // Reviewer, User, QA, Developer
    const userRole = allowedRoles.includes(role) ? role : 3;

    const isUserFound = await Users.findOne({
        where: { email: email },
    });
    const userPassword = await argon2.hash(password);
    if (isUserFound) {
        res.status(400).send({
            statusCode: 400,
            message: `Email already taken.`,
        });
    } else {
        const token = crypto.randomBytes(20).toString("hex");
        const currentDate = new Date();
        const expires = new Date(
            currentDate.getTime() +
                parseInt(process.env.EMAIL_VERIFICATION_TIME!, 10) *
                    24 *
                    60 *
                    60 *
                    1000
        );

        const url = `${
            process.env.BASE_URL
        }/verify-email/?key=${token}&expires=${expires.getTime()}`;

        await Users.create({
            name: name,
            email: email,
            password: userPassword,
            role: userRole,
            email_verification_token: token,
        });

        const mailHtml = await edge.render(
            "Templates::EmailVerificationEmail",
            {
                email: email,
                userName: name,
                url: url,
            }
        );
        const mailOptions = {
            to: email,
            from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
            subject: "Registration Confirmation",
            html: mailHtml,
        };

        const isMailSent = await MailerService.sendMail(mailOptions);

        if (isMailSent) {
            res.status(200).send({
                statusCode: 200,
                message: `An e-mail has been sent to ${email} with further instructions.`,
            });
        } else {
            res.status(500).send({
                statusCode: 500,
                message: `Internal server error.`,
            });
        }
    }
};

export default { renderSignUpForm, handleSignUpSubmission };
