import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import { SupporterReportService } from './supporterReport.service.js';

const saveOrUpdateMyReport = catchAsync(async (req: Request, res: Response) => {
    const report = await SupporterReportService.saveOrUpdateMyReport(
        req.user!.id,
        req.body
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Supporter report saved successfully',
        data: report,
    });
});

const getMyReportHistory = catchAsync(async (req: Request, res: Response) => {
    const reports = await SupporterReportService.getMyReportHistory(req.user!.id);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Supporter report history retrieved successfully',
        data: reports,
    });
});

const getMyReportByMonth = catchAsync(async (req: Request, res: Response) => {
    const report = await SupporterReportService.getMyReportByMonth(
        req.user!.id,
        req.query.month as string
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Supporter report retrieved successfully',
        data: report,
    });
});

const getMyReportById = catchAsync(async (req: Request, res: Response) => {
    const reportId = String(req.params.reportId);

    const report = await SupporterReportService.getMyReportById(
        req.user!.id,
        reportId
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Supporter report retrieved successfully',
        data: report,
    });
});

const deleteMyReport = catchAsync(async (req: Request, res: Response) => {
    const reportId = String(req.params.reportId);

    await SupporterReportService.deleteMyReport(req.user!.id, reportId);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Supporter report deleted successfully',
        data: null,
    });
});

const addAdvice = catchAsync(async (req: Request, res: Response) => {
    const reportId = String(req.params.reportId);

    const advice = await SupporterReportService.addAdvice(
        reportId,
        req.user!.id,
        req.body
    );

    res.status(httpStatus.CREATED).json({
        success: true,
        message: 'Advice added successfully',
        data: advice,
    });
});

const getAdviceList = catchAsync(async (req: Request, res: Response) => {
    const reportId = String(req.params.reportId);
    const advices = await SupporterReportService.getAdviceList(reportId);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Advice list retrieved successfully',
        data: advices,
    });
});

export const SupporterReportController = {
    saveOrUpdateMyReport,
    getMyReportHistory,
    getMyReportByMonth,
    getMyReportById,
    deleteMyReport,
    addAdvice,
    getAdviceList,
};
