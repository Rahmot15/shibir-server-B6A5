import { z } from 'zod';

const contentItemSchema = z.object({
    type: z.enum(['STORY', 'POEM', 'SCIENCE', 'ISLAMIC', 'QUIZ', 'ART', 'TRAVEL']),
    title: z.string().trim().min(1, 'Content title is required'),
    author: z.string().trim().min(1, 'Author name is required'),
    page: z.number().int().positive('Page must be a positive number'),
});

const createKishorkonthoZodSchema = z.object({
    body: z.object({
        title: z.string().trim().min(1, 'Title is required'),
        month: z.string().trim().min(1, 'Month is required'),
        year: z.number().int().min(2000).max(2100),
        price: z.number().positive('Price must be positive'),
        discount: z.number().int().min(0).max(100).optional(),
        coverImage: z.string().url('Cover image must be a valid URL'),
        description: z.string().trim().min(1, 'Description is required'),
        slug: z.string().trim().optional(),
        pdfFull: z.string().url().optional().nullable(),
        pdfPreview: z.string().url().optional().nullable(),
        isFreePreview: z.boolean().optional(),
        purchaseType: z.enum(['PHYSICAL', 'DIGITAL', 'BOTH']).optional(),
        stock: z.number().int().min(0).optional(),
        isAvailable: z.boolean().optional(),
        paymentMethods: z.array(z.enum(['BKASH', 'NAGAD', 'ROCKET', 'CARD', 'BANK'])).optional(),
        subscriptionEligible: z.boolean().optional(),
        language: z.string().optional(),
        publisherName: z.string().trim().min(1, 'Publisher name is required'),
        publisherOrg: z.string().trim().min(1, 'Publisher organization is required'),
        editorName: z.string().trim().min(1, 'Editor name is required'),
        editorRole: z.string().optional(),
        tags: z.array(z.string()).optional(),
        contents: z.array(contentItemSchema).optional(),
    }),
});

const updateKishorkonthoZodSchema = z.object({
    body: z.object({
        title: z.string().trim().min(1).optional(),
        month: z.string().trim().min(1).optional(),
        year: z.number().int().min(2000).max(2100).optional(),
        price: z.number().positive().optional(),
        discount: z.number().int().min(0).max(100).optional(),
        coverImage: z.string().url().optional(),
        description: z.string().trim().min(1).optional(),
        slug: z.string().trim().optional(),
        pdfFull: z.string().url().optional().nullable(),
        pdfPreview: z.string().url().optional().nullable(),
        isFreePreview: z.boolean().optional(),
        purchaseType: z.enum(['PHYSICAL', 'DIGITAL', 'BOTH']).optional(),
        stock: z.number().int().min(0).optional(),
        isAvailable: z.boolean().optional(),
        paymentMethods: z.array(z.enum(['BKASH', 'NAGAD', 'ROCKET', 'CARD', 'BANK'])).optional(),
        subscriptionEligible: z.boolean().optional(),
        language: z.string().optional(),
        publisherName: z.string().trim().min(1).optional(),
        publisherOrg: z.string().trim().min(1).optional(),
        editorName: z.string().trim().min(1).optional(),
        editorRole: z.string().optional(),
        tags: z.array(z.string()).optional(),
        contents: z.array(contentItemSchema).optional(),
    }),
});

const reviewZodSchema = z.object({
    body: z.object({
        rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
        comment: z.string().trim().min(1, 'Comment is required'),
    }),
});

export const KishorkonthoValidation = {
    createKishorkonthoZodSchema,
    updateKishorkonthoZodSchema,
    reviewZodSchema,
};
