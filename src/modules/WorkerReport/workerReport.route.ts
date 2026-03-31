import express from 'express';
import { Role } from '@prisma/client';
import auth from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { WorkerReportController } from './workerReport.controller.js';
import { workerReportValidationSchema } from './workerReport.validation.js';

const router = express.Router();

router.post(
	'/my',
	auth(Role.WORKER, Role.MEMBER, Role.ASSOCIATE),
	validateRequest(workerReportValidationSchema.saveReportValidationSchema),
	WorkerReportController.saveOrUpdateMyReport
);

router.get(
	'/my/history',
	auth(Role.WORKER, Role.MEMBER, Role.ASSOCIATE),
	WorkerReportController.getMyReportHistory
);

router.get(
	'/my/by-month',
	auth(Role.WORKER, Role.MEMBER, Role.ASSOCIATE),
	validateRequest(workerReportValidationSchema.monthQueryValidationSchema),
	WorkerReportController.getMyReportByMonth
);

router.get(
	'/my/:reportId',
	auth(Role.WORKER, Role.MEMBER, Role.ASSOCIATE),
	validateRequest(workerReportValidationSchema.reportIdParamValidationSchema),
	WorkerReportController.getMyReportById
);

router.delete(
	'/my/:reportId',
	auth(Role.WORKER, Role.MEMBER, Role.ASSOCIATE),
	validateRequest(workerReportValidationSchema.reportIdParamValidationSchema),
	WorkerReportController.deleteMyReport
);

router.post(
	'/:reportId/advice',
	auth(),
	validateRequest(workerReportValidationSchema.adviceValidationSchema),
	WorkerReportController.addAdvice
);

router.get(
	'/:reportId/advice',
	auth(),
	validateRequest(workerReportValidationSchema.reportIdParamValidationSchema),
	WorkerReportController.getAdviceList
);

export const WorkerReportRoutes = router;
