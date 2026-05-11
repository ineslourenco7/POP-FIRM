import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import challengesRouter from "./challenges";
import accountsRouter from "./accounts";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import payoutsRouter from "./payouts";
import leaderboardRouter from "./leaderboard";
import marketRouter from "./market";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(challengesRouter);
router.use(accountsRouter);
router.use(ordersRouter);
router.use(paymentsRouter);
router.use(payoutsRouter);
router.use(leaderboardRouter);
router.use(marketRouter);
router.use(adminRouter);

export default router;
