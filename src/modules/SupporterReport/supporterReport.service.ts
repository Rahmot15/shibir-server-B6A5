import {
    SupporterCheckboxMetric,
    SupporterNumericMetric,
} from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError.js';
import { prisma } from '../../lib/prisma.js';
import {
    FRONTEND_CHECKBOX_METRIC_MAP,
    FRONTEND_NUMERIC_METRIC_MAP,
} from './supporterReport.constant.js';
import {
    TSupporterAdvicePayload,
    TSupporterReport,
} from './supporterReport.interface.js';

const toMonthDate = (month: string) => new Date(`${month}-01T00:00:00.000Z`);

const normalizeNumericMetric = (metric: string): SupporterNumericMetric => {
    const exact = metric as SupporterNumericMetric;
    if (Object.values(SupporterNumericMetric).includes(exact)) {
        return exact;
    }

    const frontendKey = FRONTEND_NUMERIC_METRIC_MAP[metric];
    if (frontendKey) {
        return frontendKey;
    }

    throw new AppError(`Invalid numeric metric: ${metric}`, httpStatus.BAD_REQUEST);
};

const normalizeCheckboxMetric = (metric: string): SupporterCheckboxMetric => {
    const exact = metric as SupporterCheckboxMetric;
    if (Object.values(SupporterCheckboxMetric).includes(exact)) {
        return exact;
    }

    const frontendKey = FRONTEND_CHECKBOX_METRIC_MAP[metric];
    if (frontendKey) {
        return frontendKey;
    }

    throw new AppError(`Invalid checkbox metric: ${metric}`, httpStatus.BAD_REQUEST);
};

const saveOrUpdateMyReport = async (userId: string, payload: TSupporterReport) => {
    const monthDate = toMonthDate(payload.month);

    const report = await prisma.$transaction(async (tx) => {
        const baseReport = await tx.supporterReport.upsert({
            where: {
                supporterId_month: {
                    supporterId: userId,
                    month: monthDate,
                },
            },
            create: {
                supporterId: userId,
                month: monthDate,
                name: payload.name,
                school: payload.school,
            },
            update: {
                name: payload.name,
                school: payload.school,
                submittedAt: new Date(),
            },
        });

        await tx.supporterReportNumericEntry.deleteMany({
            where: { reportId: baseReport.id },
        });

        await tx.supporterReportCheckboxEntry.deleteMany({
            where: { reportId: baseReport.id },
        });

        if (payload.numericEntries.length) {
            await tx.supporterReportNumericEntry.createMany({
                data: payload.numericEntries.map((item) => ({
                    reportId: baseReport.id,
                    metric: normalizeNumericMetric(item.metric),
                    day: item.day,
                    value: item.value,
                })),
            });
        }

        if (payload.checkboxEntries.length) {
            await tx.supporterReportCheckboxEntry.createMany({
                data: payload.checkboxEntries.map((item) => ({
                    reportId: baseReport.id,
                    metric: normalizeCheckboxMetric(item.metric),
                    day: item.day,
                    checked: item.checked,
                })),
            });
        }

        return tx.supporterReport.findUnique({
            where: { id: baseReport.id },
            include: {
                numericEntries: {
                    orderBy: [{ metric: 'asc' }, { day: 'asc' }],
                },
                checkboxEntries: {
                    orderBy: [{ metric: 'asc' }, { day: 'asc' }],
                },
                advices: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    });

    return report;
};

const getMyReportHistory = async (userId: string) => {
    const reports = await prisma.supporterReport.findMany({
        where: { supporterId: userId },
        select: {
            id: true,
            month: true,
            name: true,
            school: true,
            submittedAt: true,
            _count: {
                select: {
                    numericEntries: true,
                    checkboxEntries: true,
                    advices: true,
                },
            },
        },
        orderBy: [{ month: 'desc' }, { submittedAt: 'desc' }],
    });

    return reports;
};

const getMyReportByMonth = async (userId: string, month: string) => {
    const monthDate = toMonthDate(month);
    const report = await prisma.supporterReport.findUnique({
        where: {
            supporterId_month: {
                supporterId: userId,
                month: monthDate,
            },
        },
        include: {
            numericEntries: {
                orderBy: [{ metric: 'asc' }, { day: 'asc' }],
            },
            checkboxEntries: {
                orderBy: [{ metric: 'asc' }, { day: 'asc' }],
            },
            advices: {
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!report) {
        throw new AppError('Report not found for this month', httpStatus.NOT_FOUND);
    }

    return report;
};

const getMyReportById = async (userId: string, reportId: string) => {
    const report = await prisma.supporterReport.findFirst({
        where: {
            id: reportId,
            supporterId: userId,
        },
        include: {
            numericEntries: {
                orderBy: [{ metric: 'asc' }, { day: 'asc' }],
            },
            checkboxEntries: {
                orderBy: [{ metric: 'asc' }, { day: 'asc' }],
            },
            advices: {
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!report) {
        throw new AppError('Report not found', httpStatus.NOT_FOUND);
    }

    return report;
};

const deleteMyReport = async (userId: string, reportId: string) => {
    const existing = await prisma.supporterReport.findFirst({
        where: {
            id: reportId,
            supporterId: userId,
        },
        select: { id: true },
    });

    if (!existing) {
        throw new AppError('Report not found', httpStatus.NOT_FOUND);
    }

    await prisma.supporterReport.delete({ where: { id: reportId } });

    return null;
};

const addAdvice = async (
    reportId: string,
    authorId: string,
    payload: TSupporterAdvicePayload
) => {
    const report = await prisma.supporterReport.findUnique({
        where: { id: reportId },
        select: { id: true },
    });

    if (!report) {
        throw new AppError('Report not found', httpStatus.NOT_FOUND);
    }

    const advice = await prisma.supporterAdvice.create({
        data: {
            reportId,
            authorId,
            text: payload.text,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    return advice;
};

const getAdviceList = async (reportId: string) => {
    const report = await prisma.supporterReport.findUnique({
        where: { id: reportId },
        select: { id: true },
    });

    if (!report) {
        throw new AppError('Report not found', httpStatus.NOT_FOUND);
    }

    const advices = await prisma.supporterAdvice.findMany({
        where: { reportId },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return advices;
};

export const SupporterReportService = {
    saveOrUpdateMyReport,
    getMyReportHistory,
    getMyReportByMonth,
    getMyReportById,
    deleteMyReport,
    addAdvice,
    getAdviceList,
};
