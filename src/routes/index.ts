import { Router } from 'express';
import { SupporterReportRoutes } from '../modules/SupporterReport/supporterReport.route.js';
import { NoteRoutes } from '../modules/Note/note.route.js';
import { WorkerReportRoutes } from '../modules/WorkerReport/workerReport.route.js';
import { UserRoutes } from '../modules/User/user.route.js';
import { AuthRoutes } from '../modules/auth/auth.route.js';
import { SupportChatRoutes } from '../modules/SupportChat/supportChat.route.js';
import { KishorkonthoRoutes } from '../modules/Kishorkontho/kishorkontho.route.js';
import { CartRoutes } from '../modules/Cart/cart.route.js';
import { OrderRoutes } from '../modules/Order/order.route.js';

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
  {
    path: '/kishorkontho',
    route: KishorkonthoRoutes,
  },
  {
    path: '/cart',
    route: CartRoutes,
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

