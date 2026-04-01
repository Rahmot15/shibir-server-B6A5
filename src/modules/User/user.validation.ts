import { Role } from '@prisma/client';
import { z } from 'zod';

const updateRoleValidationSchema = z.object({
    body: z.object({
        role: z.nativeEnum(Role),
    }),
});

const updateEmailVerifiedValidationSchema = z.object({
    body: z.object({
        emailVerified: z.boolean(),
    }),
});

export const userValidationSchema = {
    updateRoleValidationSchema,
    updateEmailVerifiedValidationSchema,
};
