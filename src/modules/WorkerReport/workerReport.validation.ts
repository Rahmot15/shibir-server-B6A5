import { z } from 'zod';

const reportBodyValidationSchema = z.object({
    month: z
        .string()
        .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'),
    name: z.string().trim().max(120).optional(),
    institution: z.string().trim().max(160).optional(),
    thana: z.string().trim().max(120).optional(),
    zila: z.string().trim().max(120).optional(),
    phone: z.string().trim().max(40).optional(),
    planSnapshot: z.unknown().optional(),
    numericEntries: z
        .array(
            z.object({
                metric: z.string().min(1),
                day: z.number().int().min(1).max(31),
                value: z.number().min(0),
            })
        )
        .default([]),
    checkboxEntries: z
        .array(
            z.object({
                metric: z.string().min(1),
                day: z.number().int().min(1).max(31),
                checked: z.boolean(),
            })
        )
        .default([]),
});

const saveReportValidationSchema = z.object({
    body: reportBodyValidationSchema,
});

const monthQueryValidationSchema = z.object({
    query: z.object({
        month: z
            .string()
            .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'),
    }),
});

const reportIdParamValidationSchema = z.object({
    params: z.object({
        reportId: z.string().uuid('Invalid report id'),
    }),
});

const adviceValidationSchema = z.object({
    params: z.object({
        reportId: z.string().uuid('Invalid report id'),
    }),
    body: z.object({
        text: z.string().trim().min(3, 'Advice must be at least 3 characters'),
    }),
});

export const workerReportValidationSchema = {
    saveReportValidationSchema,
    monthQueryValidationSchema,
    reportIdParamValidationSchema,
    adviceValidationSchema,
};
