import express from 'express';
import { Role } from '@prisma/client';
import auth from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { SupporterReportController } from './supporterReport.controller.js';
import { supporterReportValidationSchema } from './supporterReport.validation.js';

const router = express.Router();

router.post(
	'/my',
	auth(Role.SUPPORTER),
	validateRequest(supporterReportValidationSchema.saveReportValidationSchema),
	SupporterReportController.saveOrUpdateMyReport
);

router.get(
	'/my/history',
	auth(Role.SUPPORTER),
	SupporterReportController.getMyReportHistory
);

router.get(
	'/my/by-month',
	auth(Role.SUPPORTER),
	validateRequest(supporterReportValidationSchema.monthQueryValidationSchema),
	SupporterReportController.getMyReportByMonth
);

router.get(
	'/my/:reportId',
	auth(Role.SUPPORTER),
	validateRequest(supporterReportValidationSchema.reportIdParamValidationSchema),
	SupporterReportController.getMyReportById
);

router.delete(
	'/my/:reportId',
	auth(Role.SUPPORTER),
	validateRequest(supporterReportValidationSchema.reportIdParamValidationSchema),
	SupporterReportController.deleteMyReport
);

router.post(
	'/:reportId/advice',
	auth(),
	validateRequest(supporterReportValidationSchema.adviceValidationSchema),
	SupporterReportController.addAdvice
);

router.get(
	'/:reportId/advice',
	auth(),
	validateRequest(supporterReportValidationSchema.reportIdParamValidationSchema),
	SupporterReportController.getAdviceList
);

export const SupporterReportRoutes = router;
