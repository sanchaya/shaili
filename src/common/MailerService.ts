import nodemailer from "nodemailer";

const MailerService = nodemailer.createTransport({
  port: Number(process.env.MAIL_PORT),
  host: process.env.MAIL_HOST,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export default MailerService;
