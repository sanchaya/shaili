import { Request, Response } from "express";
import "dotenv/config";
import Users from "../db/models/Users.js";
import { OAuth2Client } from "google-auth-library";
import { sendWelcomeEmail } from "./EmailVerificationController.js";

const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "postmessage"
);

const SignInWithGmailController = async (req: Request, res: Response) => {
    try {
        const { token }: any = req.body;
        const ClientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const googleResponse = await oAuth2Client.verifyIdToken({
            idToken: token.credential,
            audience: process.env.CLIENT_ID,
        });
        const payLoad = googleResponse.getPayload();
        const email = payLoad?.email;
        const userName = payLoad?.name;

        if (!ClientSecret) {
            return res.status(401).send("Server Error");
        }

        const user = await Users.findOne({ where: { email: email } });

        if (user) {
            return res
                .status(200)
                .json({ message: "User found", email: email });
        } else {
            if (userName && email) {
                const newUser = await Users.create({
                    name: userName,
                    role: 3,
                    email: email,
                    is_active: true,
                });
                sendWelcomeEmail(email, userName);
                return res.status(200).json({
                    message: "New user created and authorized",
                    email: newUser.email,
                });
            }
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export default { SignInWithGmailController };
