import { Role } from '@prisma/client';

export type TUserRolePayload = {
    role: Role;
};

export type TUserEmailVerifiedPayload = {
    emailVerified: boolean;
};
