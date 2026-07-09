import { Role } from '@prisma/client';

export const supportChatAllowedRoles = [
  Role.ADMIN,
  Role.ASSOCIATE,
  Role.MEMBER,
  Role.SUPPORTER,
  Role.WORKER,
];

export const supportMessageMaxLength = 2000;
