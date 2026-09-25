import { Router } from "express";
import { healthRouter } from "./health.routes.js";

// Rotas montadas sob /api/v1 (DEC-016).
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
