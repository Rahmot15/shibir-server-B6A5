import express from 'express';
import auth from '../../middlewares/auth.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { KishorkonthoController } from './kishorkontho.controller.js';
import { KishorkonthoValidation } from './kishorkontho.validation.js';
import { Role } from '@prisma/client';

const router = express.Router();

router.get(
    '/',
    KishorkonthoController.getAllIssues
);

router.get(
    '/slug/:slug',
    KishorkonthoController.getIssueBySlug
);

router.get(
    '/:id',
    KishorkonthoController.getIssueById
);

router.post(
    '/',
    auth(Role.ADMIN),
    validateRequest(KishorkonthoValidation.createKishorkonthoZodSchema),
    KishorkonthoController.createIssue
);

router.patch(
    '/:id',
    auth(Role.ADMIN),
    validateRequest(KishorkonthoValidation.updateKishorkonthoZodSchema),
    KishorkonthoController.updateIssue
);

router.delete(
    '/:id',
    auth(Role.ADMIN),
    KishorkonthoController.deleteIssue
);

router.post(
    '/:id/reviews',
    auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
    validateRequest(KishorkonthoValidation.reviewZodSchema),
    KishorkonthoController.addReview
);

router.patch(
    '/:id/reviews/:reviewId',
    auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
    validateRequest(KishorkonthoValidation.updateReviewZodSchema),
    KishorkonthoController.updateReview
);

router.delete(
    '/:id/reviews/:reviewId',
    auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
    KishorkonthoController.deleteReview
);

router.post(
    '/:id/download',
    auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
    KishorkonthoController.trackDownload
);

router.post(
    '/:id/reviews/:reviewId/report',
    auth(Role.ADMIN, Role.ASSOCIATE, Role.MEMBER, Role.SUPPORTER, Role.WORKER),
    KishorkonthoController.reportReview
);

router.patch(
    '/reviews/:reviewId/moderate',
    auth(Role.ADMIN),
    KishorkonthoController.moderateReview
);

router.get(
    '/reviews/reported',
    auth(Role.ADMIN),
    KishorkonthoController.getReportedReviews
);

export const KishorkonthoRoutes = router;
