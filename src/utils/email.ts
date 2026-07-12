import ejs from "ejs";
import httpStatus from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import { envVars } from "../config/env.js";
import AppError from "../errors/AppError.js";

type OTPType = "sign-in" | "email-verification" | "forget-password" | "change-email";

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, unknown>;
}

const otpPurpose: Record<OTPType, string> = {
  "email-verification": "verify your email address",
  "forget-password": "reset your password",
  "change-email": "confirm your email change",
  "sign-in": "sign in to your account",
};

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
  secure: Number(envVars.EMAIL_SENDER.SMTP_PORT) === 465,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS,
  },
});

// Same reusable template-based pattern as the PH Healthcare project.
export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
}: SendEmailOptions) => {
  try {
    const templatePath = path.resolve(
      process.cwd(),
      `src/templates/${templateName}.ejs`,
    );
    const html = await ejs.renderFile(templatePath, templateData);

    await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    throw new AppError("Failed to send email", httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export const sendEmailVerificationOTP = async ({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: OTPType;
}) => {
  await sendEmail({
    to: email,
    subject: `Your Shibir verification code: ${otp}`,
    templateName: "otp",
    templateData: { otp, purpose: otpPurpose[type] },
  });
};
