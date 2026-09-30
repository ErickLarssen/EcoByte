import type { Request, Response } from "express";
import { getCentralEcopoint, updateCentralEcopoint } from "../services/ecopoint.service.js";
import { sendSuccess } from "../utils/api-response.js";
import type { UpdateEcopointInput } from "../validators/ecopoint.validators.js";

// GET /api/v1/ecopoint
export async function getEcopointHandler(_req: Request, res: Response): Promise<void> {
  const ecopoint = await getCentralEcopoint();
  sendSuccess(res, 200, "Ecoponto encontrado.", { ecopoint });
}

// PATCH /api/v1/ecopoint
export async function updateEcopointHandler(req: Request, res: Response): Promise<void> {
  const ecopoint = await updateCentralEcopoint(req.body as UpdateEcopointInput);
  sendSuccess(res, 200, "Ecoponto atualizado.", { ecopoint });
}
