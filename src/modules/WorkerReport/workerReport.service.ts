import {
    Prisma,
    Role,
    WorkerCheckboxMetric,
    WorkerNumericMetric,
} from '@prisma/client';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError.js';
import { prisma } from '../../lib/prisma.js';
import {
    FRONTEND_WORKER_CHECKBOX_METRIC_MAP,
    FRONTEND_WORKER_NUMERIC_METRIC_MAP,
} from './workerReport.constant.js';
import {
    TWorkerAdvicePayload,
    TWorkerReport,
} from './workerReport.interface.js';

const ALLOWED_REPORTER_ROLES: Role[] = [Role.WORKER, Role.MEMBER, Role.ASSOCIATE];

const toMonthDate = (month: string) => new Date(`${month}-01T00:00:00.000Z`);

const normalizeNumericMetric = (metric: string): WorkerNumericMetric => {
    const exact = metric as WorkerNumericMetric;
    if (Object.values(WorkerNumericMetric).includes(exact)) {
        return exact;
    }

    const frontendKey = FRONTEND_WORKER_NUMERIC_METRIC_MAP[metric];
    if (frontendKey) {
        return frontendKey;
    }

    throw new AppError(`Invalid numeric metric: ${metric}`, httpStatus.BAD_REQUEST);
};

const normalizeCheckboxMetric = (metric: string): WorkerCheckboxMetric => {
    const exact = metric as WorkerCheckboxMetric;
    if (Object.values(WorkerCheckboxMetric).includes(exact)) {
        return exact;
    }

    const frontendKey = FRONTEND_WORKER_CHECKBOX_METRIC_MAP[metric];
    if (frontendKey) {
        return frontendKey;
    }

    throw new AppError(`Invalid checkbox metric: ${metric}`, httpStatus.BAD_REQUEST);
};

const assertReporterRole = (role: Role) => {
    if (!ALLOWED_REPORTER_ROLES.includes(role)) {
        throw new AppError('This role is not allowed for worker report', httpStatus.FORBIDDEN);
    }
};

const normalizePlanSnapshot = (value: Prisma.InputJsonValue | null | undefined) => {
    if (value === null) {
        return Prisma.JsonNull;
    }

    return value;
};

const saveOrUpdateMyReport = async (
    userId: string,
    role: Role,
    payload: TWorkerReport
) => {
    assertReporterRole(role);
    const monthDate = toMonthDate(payload.month);

    const report = await prisma.$transaction(async (tx) => {
        const baseReport = await tx.workerReport.upsert({
            where: {
                reporterId_month: {
                    reporterId: userId,
                    month: monthDate,
                },
            },
            create: {
                reporterId: userId,
                reporterRole: role,
                month: monthDate,
                name: payload.name,
                institution: payload.institution,
                thana: payload.thana,
                zila: payload.zila,
                phone: payload.phone,
                planSnapshot: normalizePlanSnapshot(payload.planSnapshot),
            },
            update: {
                reporterRole: role,
                name: payload.name,
                institution: payload.institution,
                thana: payload.thana,
                zila: payload.zila,
                phone: payload.phone,
                planSnapshot: normalizePlanSnapshot(payload.planSnapshot),
                submittedAt: new Date(),
            },
        });

        await tx.workerReportNumericEntry.deleteMany({
            where: { reportId: baseReport.id },
        });

        await tx.workerReportCheckboxEntry.deleteMany({
            where: { reportId: baseReport.id },
        });

        if (payload.numericEntries.length) {
            await tx.workerReportNumericEntry.createMany({
                data: payload.numericEntries.map((item) => ({
                    reportId: baseReport.id,
                    metric: normalizeNumericMetric(item.metric),
                    day: item.day,
                    value: item.value,
                })),
            });
        }

        if (payload.checkboxEntries.length) {
            await tx.workerReportCheckboxEntry.createMany({
                data: payload.checkboxEntries.map((item) => ({
                    reportId: baseReport.id,
                    metric: normalizeCheckboxMetric(item.metric),
                    day: item.day,
                    checked: item.checked,
                })),
            });
        }

        return tx.workerReport.findUnique({
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

const getMyReportHistory = async (userId: string, role: Role) => {
    assertReporterRole(role);

    const reports = await prisma.workerReport.findMany({
        where: { reporterId: userId },
        select: {
            id: true,
            month: true,
            reporterRole: true,
            name: true,
            institution: true,
            thana: true,
            zila: true,
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

const getMyReportByMonth = async (userId: string, role: Role, month: string) => {
    assertReporterRole(role);
    const monthDate = toMonthDate(month);

    const report = await prisma.workerReport.findUnique({
        where: {
            reporterId_month: {
                reporterId: userId,
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

const getMyReportById = async (userId: string, role: Role, reportId: string) => {
    assertReporterRole(role);

    const report = await prisma.workerReport.findFirst({
        where: {
            id: reportId,
            reporterId: userId,
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

const deleteMyReport = async (userId: string, role: Role, reportId: string) => {
    assertReporterRole(role);

    const existing = await prisma.workerReport.findFirst({
        where: {
            id: reportId,
            reporterId: userId,
        },
        select: { id: true },
    });

    if (!existing) {
        throw new AppError('Report not found', httpStatus.NOT_FOUND);
    }

    await prisma.workerReport.delete({ where: { id: reportId } });

    return null;
};

const addAdvice = async (
    reportId: string,
    authorId: string,
    payload: TWorkerAdvicePayload
) => {
    const report = await prisma.workerReport.findUnique({
        where: { id: reportId },
        select: { id: true },
    });

    if (!report) {
        throw new AppError('Report not found', httpStatus.NOT_FOUND);
    }

    const advice = await prisma.workerAdvice.create({
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
    const report = await prisma.workerReport.findUnique({
        where: { id: reportId },
        select: { id: true },
    });

    if (!report) {
        throw new AppError('Report not found', httpStatus.NOT_FOUND);
    }

    const advices = await prisma.workerAdvice.findMany({
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

export const WorkerReportService = {
    saveOrUpdateMyReport,
    getMyReportHistory,
    getMyReportByMonth,
    getMyReportById,
    deleteMyReport,
    addAdvice,
    getAdviceList,
};
