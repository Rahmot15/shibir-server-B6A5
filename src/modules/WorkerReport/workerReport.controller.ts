import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync.js';
import { WorkerReportService } from './workerReport.service.js';

const saveOrUpdateMyReport = catchAsync(async (req: Request, res: Response) => {
    const report = await WorkerReportService.saveOrUpdateMyReport(
        req.user!.id,
        req.user!.role,
        req.body
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Worker report saved successfully',
        data: report,
    });
});

const getMyReportHistory = catchAsync(async (req: Request, res: Response) => {
    const reports = await WorkerReportService.getMyReportHistory(req.user!.id, req.user!.role);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Worker report history retrieved successfully',
        data: reports,
    });
});

const getMyReportByMonth = catchAsync(async (req: Request, res: Response) => {
    const report = await WorkerReportService.getMyReportByMonth(
        req.user!.id,
        req.user!.role,
        req.query.month as string
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Worker report retrieved successfully',
        data: report,
    });
});

const getMyReportById = catchAsync(async (req: Request, res: Response) => {
    const reportId = String(req.params.reportId);
    const report = await WorkerReportService.getMyReportById(
        req.user!.id,
        req.user!.role,
        reportId
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Worker report retrieved successfully',
        data: report,
    });
});

const deleteMyReport = catchAsync(async (req: Request, res: Response) => {
    const reportId = String(req.params.reportId);

    await WorkerReportService.deleteMyReport(req.user!.id, req.user!.role, reportId);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Worker report deleted successfully',
        data: null,
    });
});

const addAdvice = catchAsync(async (req: Request, res: Response) => {
    const reportId = String(req.params.reportId);

    const advice = await WorkerReportService.addAdvice(
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
    const advices = await WorkerReportService.getAdviceList(reportId);

    res.status(httpStatus.OK).json({
        success: true,
        message: 'Advice list retrieved successfully',
        data: advices,
    });
});

export const WorkerReportController = {
    saveOrUpdateMyReport,
    getMyReportHistory,
    getMyReportByMonth,
    getMyReportById,
    deleteMyReport,
    addAdvice,
    getAdviceList,
};
