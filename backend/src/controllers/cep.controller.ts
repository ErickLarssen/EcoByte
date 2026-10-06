import type { Request, Response } from "express";
import { lookupCep, type CepProvider } from "../services/cep.service.js";
import { sendSuccess } from "../utils/api-response.js";

// GET /api/v1/cep/:cep
export function lookupCepHandler(provider: CepProvider) {
  return async (req: Request<{ cep: string }>, res: Response): Promise<void> => {
    const address = await lookupCep(provider, req.params.cep);
    sendSuccess(res, 200, "CEP encontrado.", { address });
  };
}
