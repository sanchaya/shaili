import { Request, Response } from "express";
import edge from "../../common/EdgeConfig.js";
import Users from "../db/models/Users.js";
import MailerService from "../../common/MailerService.js";

export const renderEmailVerificationPage = async (
    req: Request,
    res: Response
) => {
    const { key, expires } = req.query as { key: string; expires: string };
    const currentTime: number = new Date().getTime();

    const isTokenFound = await Users.findOne({
        where: { email_verification_token: key },
    });

    if (!isTokenFound) {
        const html = await edge.render("Pages::VerifyEmail", {
            notFound: true,
        });
        res.send(html);
    } else if (Number(expires) < currentTime) {
        const html = await edge.render("Pages::VerifyEmail", {
            notFound: false,
            expired: true,
        });
        res.send(html);
    } else {
        const user = await Users.findOne({
            where: { email_verification_token: key },
        });

        await Users.update(
            {
                email_verified_at: new Date(),
                is_active: true,
                email_verification_token: null,
            },
            { where: { email: user?.dataValues.email } }
        );

        const html = await edge.render("Pages::VerifyEmail", {
            notFound: false,
            expired: false,
            valid: true,
        });

        if (user?.email && user?.name) sendWelcomeEmail(user.email, user.name);

        res.send(html);
    }
};

export const sendWelcomeEmail = async (email: string, userName: string) => {
    const mailHtml = await edge.render("Templates::WelcomeEmail", {
        name: userName,
        url: process.env.BASE_URL,
    });
    const mailOptions = {
        to: email,
        from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
        subject: "Welcome to Type Extract",
        html: mailHtml,
    };

    await MailerService.sendMail(mailOptions);
};

export default { renderEmailVerificationPage };
