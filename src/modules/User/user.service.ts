import { Role } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

const getAllUsers = async () => {
    return prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};

const updateUserRole = async (id: string, role: Role) => {
    return prisma.user.update({
        where: { id },
        data: { role },
        select: {
            id: true,
            role: true,
        },
    });
};

const updateUserEmailVerified = async (id: string, emailVerified: boolean) => {
    return prisma.user.update({
        where: { id },
        data: { emailVerified },
        select: {
            id: true,
            emailVerified: true,
        },
    });
};

export const UserService = {
    getAllUsers,
    updateUserRole,
    updateUserEmailVerified,
};
