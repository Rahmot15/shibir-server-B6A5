import { Router } from 'express';
<<<<<<< HEAD
=======

>>>>>>> fb9a1bf814a487e51c3a588f0f2d1c33c0d79772
import { SupporterReportRoutes } from '../modules/SupporterReport/supporterReport.route.js';
import { NoteRoutes } from '../modules/Note/note.route.js';
import { WorkerReportRoutes } from '../modules/WorkerReport/workerReport.route.js';
import { UserRoutes } from '../modules/User/user.route.js';
import { AuthRoutes } from '../modules/auth/auth.route.js';
import { SupportChatRoutes } from '../modules/SupportChat/supportChat.route.js';

const router = Router();

// Add all module routes here and they will be mounted from this router.
const moduleRoutes: { path: string; route: Router }[] = [
  // {
  //   path: '/auth',
  //   route: AuthRoutes,
  // },
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
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/support',
    route: SupportChatRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

