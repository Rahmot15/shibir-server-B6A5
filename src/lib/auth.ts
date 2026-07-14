import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, emailOTP } from "better-auth/plugins";
import { prisma } from "./prisma.js";
import { Role, UserStatus } from "@prisma/client";
import { sendEmail } from "../utils/email.js";
import { envVars } from "../config/env.js";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      // callbackUrl: envVars.GOOGLE_CALLBACK_URL,
      mapProfileToUser: () => {
        return {
          role: Role.SUPPORTER,
          status: UserStatus.ACTIVE,
          needPasswordChange: false,
          emailVerified: true,
          isDeleted: false,
          deletedAt: null,
        };
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.SUPPORTER,
      },

      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },

      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },

      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },

      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 60 * 24, // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24, // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24, // 1 day in seconds
    },
  },

  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) return;

        if (type === "email-verification" && !user.emailVerified) {
          await sendEmail({
            to: email,
            subject: "Verify your email",
            templateName: "otp",
            templateData: {
              name: user.name,
              otp,
              purpose: "verify your email address",
            },
          });
        } else if (type === "forget-password") {
          await sendEmail({
            to: email,
            subject: "Password Reset OTP",
            templateName: "otp",
            templateData: {
              name: user.name,
              otp,
              purpose: "reset your password",
            },
          });
        } else if (type === "change-email") {
          await sendEmail({
            to: email,
            subject: "Change Email OTP",
            templateName: "otp",
            templateData: {
              name: user.name,
              otp,
              purpose: "confirm your email change",
            },
          });
        } else if (type === "sign-in") {
          await sendEmail({
            to: email,
            subject: "Sign In OTP",
            templateName: "otp",
            templateData: {
              name: user.name,
              otp,
              purpose: "sign in to your account",
            },
          });
        }
      },
      expiresIn: 2 * 60, // 2 minutes
      otpLength: 6,
    }),
  ],

  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`,
  },

  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:5000",
    envVars.FRONTEND_URL,
  ],

  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: true,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
    },
  },
});

