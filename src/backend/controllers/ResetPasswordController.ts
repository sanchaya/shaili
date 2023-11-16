import { Request, Response } from "express";
import PasswordResetTokens from "../db/models/PasswordResetTokens.js";
import edge from "../../common/EdgeConfig.js";
import Users from "../db/models/Users.js";
import { hash } from "argon2";

export const renderResetPasswordForm = async (req: Request, res: Response) => {
  const { key, expires } = req.query as { key: string; expires: string };
  const currentTime: number = new Date().getTime();
  const passwordReset = await PasswordResetTokens.findOne({
    where: { token: key },
  });

  if (!passwordReset) {
    const html = await edge.render("Pages::ResetPassword", { notFound: true });
    res.send(html);
  } else if (Number(expires) < currentTime) {
    const html = await edge.render("Pages::ResetPassword", {
      notFound: false,
      expired: true,
    });
    res.send(html);
  } else {
    const html = await edge.render("Pages::ResetPassword", {
      notFound: false,
      expired: false,
      valid: true,
      token: key,
    });
    res.send(html);
  }
};

export const handleResetPasswordSubmission = async (
  req: Request,
  res: Response
) => {
  const { token, password } = req.body as { token: string; password: string };
  const passwordReset = await PasswordResetTokens.findOne({
    where: { token: token },
  });
  if (!passwordReset) {
    res.status(404).send({
      statusCode: 404,
      message: `The verification link appears to be invalid.`,
    });
  } else {
    const email = passwordReset.email;
    const hashedPassword = await hash(password);
    const updatedUser = await Users.update(
      { password: hashedPassword },
      { where: { email } }
    );
    if (updatedUser[0] === 1) {
      passwordReset.destroy();
      res.status(200).send({
        statusCode: 200,
        message: `Password has been updated successfully.You can login with your new password`,
      });
    } else {
      res.status(500).send({
        statusCode: 500,
        message: `Internal server error. Please try again later.`,
      });
    }
  }
};

export default { renderResetPasswordForm, handleResetPasswordSubmission };
