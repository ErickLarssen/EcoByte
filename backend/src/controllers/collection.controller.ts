import type { Request, Response } from "express";
import type { CollectionEvent } from "../domain/collection-status.js";
import { parseInput } from "../middlewares/validate-body.js";
import {
  applyCollectorEvent,
  createCollection,
  getClientCollection,
  getCollectorCollection,
  listAssignedCollections,
  listAvailableCollections,
  listClientCollections,
} from "../services/collection.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { paginationQuerySchema } from "../validators/collection.validators.js";

// req.user é garantido por requireAuth nas rotas de coleta.
const userId = (req: Request) => req.user!.id;

// POST /api/v1/collections
export async function create(req: Request, res: Response): Promise<void> {
  const collection = await createCollection(userId(req), req.body);
  sendSuccess(res, 201, "Coleta solicitada com sucesso.", { collection });
}

// GET /api/v1/collections
export async function listMine(req: Request, res: Response): Promise<void> {
  const page = await listClientCollections(userId(req), parseInput(paginationQuerySchema, req.query));
  sendSuccess(res, 200, "Coletas encontradas.", page);
}

// GET /api/v1/collections/available
export async function listAvailable(req: Request, res: Response): Promise<void> {
  const page = await listAvailableCollections(userId(req), parseInput(paginationQuerySchema, req.query));
  sendSuccess(res, 200, "Coletas disponíveis.", page);
}

// GET /api/v1/collections/assigned
export async function listAssigned(req: Request, res: Response): Promise<void> {
  const page = await listAssignedCollections(userId(req), parseInput(paginationQuerySchema, req.query));
  sendSuccess(res, 200, "Coletas atribuídas.", page);
}

// GET /api/v1/collections/:id — a visão depende do perfil (DEC-070).
export async function getById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const collection =
    req.user!.role === "COLETOR"
      ? await getCollectorCollection(req.params.id, userId(req))
      : await getClientCollection(req.params.id, userId(req));

  sendSuccess(res, 200, "Coleta encontrada.", { collection });
}

const EVENT_MESSAGES: Record<CollectionEvent, string> = {
  accept: "Coleta aceita.",
  start: "Rota iniciada.",
  collect: "Recolhimento confirmado.",
  deliver: "Entrega no ecoponto registrada.",
  complete: "Coleta concluída.",
};

// POST /api/v1/collections/:id/{accept|start|collect|deliver|complete} (DEC-064)
export function collectorAction(event: CollectionEvent) {
  return async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const collection = await applyCollectorEvent(req.params.id, userId(req), event);
    sendSuccess(res, 200, EVENT_MESSAGES[event], { collection });
  };
}
