import { Prisma } from '@prisma/client';

export type TWorkerReport = {
    month: string;
    name?: string;
    institution?: string;
    thana?: string;
    zila?: string;
    phone?: string;
    planSnapshot?: Prisma.InputJsonValue | null;
    numericEntries: {
        metric: string;
        day: number;
        value: number;
    }[];
    checkboxEntries: {
        metric: string;
        day: number;
        checked: boolean;
    }[];
};

export type TWorkerAdvicePayload = {
    text: string;
};

export type TWorkerPlanPayload = {
    month: string;
    name?: string;
    institution?: string;
    thana?: string;
    zila?: string;
    phone?: string;
    planSnapshot?: Prisma.InputJsonValue | null;
};
