import { Request, Response } from 'express';
import status from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import { KishorkonthoService } from './kishorkontho.service.js';

const createIssue = catchAsync(async (req: Request, res: Response) => {
    const result = await KishorkonthoService.createIssue(req.body);
    res.status(status.OK).json({
        success: true,
        message: 'Kishorkontho issue created successfully',
        data: result,
    });
});

const getAllIssues = catchAsync(async (req: Request, res: Response) => {
    const result = await KishorkonthoService.getAllIssues(req.query);
    res.status(status.OK).json({
        success: true,
        message: 'Kishorkontho issues fetched successfully',
        data: result.issues,
        meta: result.meta,
    });
});

const getIssueBySlug = catchAsync(async (req: Request, res: Response) => {
    const result = await KishorkonthoService.getIssueBySlug(req.params.slug as string);
    if (!result) {
        res.status(status.NOT_FOUND).json({
            success: false,
            message: 'Issue not found',
        });
        return;
    }
    res.status(status.OK).json({
        success: true,
        message: 'Kishorkontho issue fetched successfully',
        data: result,
    });
});

const getIssueById = catchAsync(async (req: Request, res: Response) => {
    const result = await KishorkonthoService.getIssueById(req.params.id as string);
    if (!result) {
        res.status(status.NOT_FOUND).json({
            success: false,
            message: 'Issue not found',
        });
        return;
    }
    res.status(status.OK).json({
        success: true,
        message: 'Kishorkontho issue fetched successfully',
        data: result,
    });
});

const updateIssue = catchAsync(async (req: Request, res: Response) => {
    const result = await KishorkonthoService.updateIssue(req.params.id as string, req.body);
    res.status(status.OK).json({
        success: true,
        message: 'Kishorkontho issue updated successfully',
        data: result,
    });
});

const deleteIssue = catchAsync(async (req: Request, res: Response) => {
    await KishorkonthoService.deleteIssue(req.params.id as string);
    res.status(status.OK).json({
        success: true,
        message: 'Kishorkontho issue deleted successfully',
    });
});

const addReview = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await KishorkonthoService.addReview(
        req.params.id as string,
        user.id,
        req.body.rating,
        req.body.comment
    );
    res.status(status.OK).json({
        success: true,
        message: 'Review added successfully',
        data: result,
    });
});

const trackDownload = catchAsync(async (req: Request, res: Response) => {
    const result = await KishorkonthoService.trackDownload(req.params.id as string);
    res.status(status.OK).json({
        success: true,
        message: 'Download tracked',
        data: result,
    });
});

export const KishorkonthoController = {
    createIssue,
    getAllIssues,
    getIssueBySlug,
    getIssueById,
    updateIssue,
    deleteIssue,
    addReview,
    trackDownload,
};
