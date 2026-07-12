import { z } from "zod";

const changePasswordZodSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(6, "New password must be at least 6 characters"),
    })
    .refine(({ currentPassword, newPassword }) => currentPassword !== newPassword, {
      message: "New password must be different from the current password",
      path: ["newPassword"],
    }),
});

export const AuthValidation = {
  changePasswordZodSchema,
};
