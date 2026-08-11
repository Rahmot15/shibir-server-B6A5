import { KishorkonthoIssue, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { TKishorkonthoCreateInput, TKishorkonthoUpdateInput } from './kishorkontho.interface.js';

function generateSlug(title: string, month: string, year: number): string {
    const slugBase = title
        .toLowerCase()
        .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return `${slugBase}-${month}-${year}`;
}

const createIssue = async (data: TKishorkonthoCreateInput): Promise<KishorkonthoIssue> => {
    const finalPrice = data.discount
        ? data.price - (data.price * data.discount) / 100
        : data.price;

    const slug = data.slug || generateSlug(data.title, data.month, data.year);

    const result = await prisma.kishorkonthoIssue.create({
        data: {
            title: data.title,
            month: data.month,
            year: data.year,
            price: data.price,
            discount: data.discount || 0,
            finalPrice,
            coverImage: data.coverImage,
            description: data.description,
            slug,
            pdfFull: data.pdfFull || null,
            pdfPreview: data.pdfPreview || null,
            isFreePreview: data.isFreePreview || false,
            purchaseType: data.purchaseType || 'BOTH',
            stock: data.stock || 0,
            isAvailable: data.isAvailable ?? true,
            paymentMethods: data.paymentMethods || ['BKASH', 'NAGAD'],
            subscriptionEligible: data.subscriptionEligible || false,
            language: data.language || 'Bangla',
            publisherName: data.publisherName,
            publisherOrg: data.publisherOrg,
            editorName: data.editorName,
            editorRole: data.editorRole || 'Editor',
            tags: data.tags || [],
            contents: data.contents
                ? {
                      create: data.contents.map((c) => ({
                          type: c.type,
                          title: c.title,
                          author: c.author,
                          page: c.page,
                      })),
                  }
                : undefined,
        },
        include: {
            contents: true,
            reviews: true,
        },
    });

    return result;
};

const getAllIssues = async (query: Record<string, unknown>) => {
    const {
        search,
        month,
        year,
        purchaseType,
        isAvailable,
        minPrice,
        maxPrice,
        page = 1,
        limit = 12,
    } = query as {
        search?: string;
        month?: string;
        year?: string;
        purchaseType?: string;
        isAvailable?: string;
        minPrice?: string;
        maxPrice?: string;
        page?: number;
        limit?: number;
    };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.KishorkonthoIssueWhereInput = {
        isDeleted: false,
    };

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { month: { contains: search, mode: 'insensitive' } },
            { publisherName: { contains: search, mode: 'insensitive' } },
        ];
    }

    if (month) {
        where.month = month;
    }

    if (year) {
        where.year = Number(year);
    }

    if (purchaseType) {
        where.purchaseType = purchaseType as 'PHYSICAL' | 'DIGITAL' | 'BOTH';
    }

    if (isAvailable !== undefined) {
        where.isAvailable = isAvailable === 'true';
    }

    if (minPrice || maxPrice) {
        where.finalPrice = {};
        if (minPrice) where.finalPrice.gte = Number(minPrice);
        if (maxPrice) where.finalPrice.lte = Number(maxPrice);
    }

    const [issues, total] = await Promise.all([
        prisma.kishorkonthoIssue.findMany({
            where,
            include: {
                contents: true,
                reviews: {
                    select: { rating: true },
                },
            },
            orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
            skip,
            take: limitNum,
        }),
        prisma.kishorkonthoIssue.count({ where }),
    ]);

    return {
        issues,
        meta: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        },
    };
};

const getIssueBySlug = async (slug: string) => {
    const issue = await prisma.kishorkonthoIssue.findUnique({
        where: { slug },
        include: {
            contents: { orderBy: { page: 'asc' } },
            reviews: {
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (issue) {
        await prisma.kishorkonthoIssue.update({
            where: { id: issue.id },
            data: { views: { increment: 1 } },
        });
    }

    return issue;
};

const getIssueById = async (id: string) => {
    return prisma.kishorkonthoIssue.findUnique({
        where: { id },
        include: {
            contents: { orderBy: { page: 'asc' } },
            reviews: {
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
                    },
                },
            },
        },
    });
};

const updateIssue = async (id: string, data: TKishorkonthoUpdateInput): Promise<KishorkonthoIssue> => {
    const updateData: Prisma.KishorkonthoIssueUpdateInput = {};

    if (data.title) updateData.title = data.title;
    if (data.month) updateData.month = data.month;
    if (data.year) updateData.year = data.year;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.discount !== undefined) updateData.discount = data.discount;
    if (data.coverImage) updateData.coverImage = data.coverImage;
    if (data.description) updateData.description = data.description;
    if (data.slug) updateData.slug = data.slug;
    if (data.pdfFull !== undefined) updateData.pdfFull = data.pdfFull;
    if (data.pdfPreview !== undefined) updateData.pdfPreview = data.pdfPreview;
    if (data.isFreePreview !== undefined) updateData.isFreePreview = data.isFreePreview;
    if (data.purchaseType) updateData.purchaseType = data.purchaseType;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;
    if (data.paymentMethods) updateData.paymentMethods = data.paymentMethods;
    if (data.subscriptionEligible !== undefined) updateData.subscriptionEligible = data.subscriptionEligible;
    if (data.language) updateData.language = data.language;
    if (data.publisherName) updateData.publisherName = data.publisherName;
    if (data.publisherOrg) updateData.publisherOrg = data.publisherOrg;
    if (data.editorName) updateData.editorName = data.editorName;
    if (data.editorRole) updateData.editorRole = data.editorRole;
    if (data.tags) updateData.tags = data.tags;

    if (data.price !== undefined || data.discount !== undefined) {
        const existing = await prisma.kishorkonthoIssue.findUnique({ where: { id } });
        if (existing) {
            const price = data.price ?? Number(existing.price);
            const discount = data.discount ?? existing.discount;
            updateData.finalPrice = price - (price * discount) / 100;
        }
    }

    if (data.contents) {
        await prisma.kishorkonthoContent.deleteMany({ where: { issueId: id } });
        updateData.contents = {
            create: data.contents.map((c) => ({
                type: c.type,
                title: c.title,
                author: c.author,
                page: c.page,
            })),
        };
    }

    const result = await prisma.kishorkonthoIssue.update({
        where: { id },
        data: updateData,
        include: {
            contents: true,
            reviews: true,
        },
    });

    return result;
};

const deleteIssue = async (id: string) => {
    return prisma.kishorkonthoIssue.delete({
        where: { id },
    });
};

const addReview = async (issueId: string, userId: string, rating: number, comment: string) => {
    const result = await prisma.kishorkonthoReview.create({
        data: {
            issueId,
            userId,
            rating,
            comment,
        },
        include: {
            user: {
                select: { id: true, name: true, image: true },
            },
        },
    });

    const stats = await prisma.kishorkonthoReview.aggregate({
        where: { issueId },
        _avg: { rating: true },
        _count: { rating: true },
    });

    await prisma.kishorkonthoIssue.update({
        where: { id: issueId },
        data: {
            averageRating: stats._avg.rating || 0,
            ratingCount: stats._count.rating,
        },
    });

    return result;
};

export const KishorkonthoService = {
    createIssue,
    getAllIssues,
    getIssueBySlug,
    getIssueById,
    updateIssue,
    deleteIssue,
    addReview,
};
