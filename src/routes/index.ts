import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route.js';
import { SupporterReportRoutes } from '../modules/SupporterReport/supporterReport.route.js';
import { NoteRoutes } from '../modules/Note/note.route.js';
import { WorkerReportRoutes } from '../modules/WorkerReport/workerReport.route.js';

const router = Router();

// Add all module routes here and they will be mounted from this router.
const moduleRoutes: { path: string; route: Router }[] = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/supporter-report',
    route: SupporterReportRoutes,
  },
  {
    path: '/worker-report',
    route: WorkerReportRoutes,
  },
  {
    path: '/notes',
    route: NoteRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

