import type { Request, Response } from "express";
import { sendSuccess } from "../utils/api-response.js";

// GET /api/v1/health (05_ROUTES §4.1)
export function getHealth(_req: Request, res: Response): void {
  sendSuccess(res, 200, "API operacional.", { status: "up" });
}
