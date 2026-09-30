import type { Request, Response } from "express";
import { parseInput } from "../middlewares/validate-body.js";
import {
  getCollection,
  getUser,
  listCollections,
  listUsers,
  updateUserStatus,
} from "../services/admin.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { adminCollectionsQuerySchema, type UpdateUserStatusInput } from "../validators/admin.validators.js";
import { paginationQuerySchema } from "../validators/collection.validators.js";

// GET /api/v1/admin/users
export async function listUsersHandler(req: Request, res: Response): Promise<void> {
  const page = await listUsers(parseInput(paginationQuerySchema, req.query));
  sendSuccess(res, 200, "Usuários encontrados.", page);
}

// GET /api/v1/admin/users/:id
export async function getUserHandler(req: Request<{ id: string }>, res: Response): Promise<void> {
  const user = await getUser(req.params.id);
  sendSuccess(res, 200, "Usuário encontrado.", { user });
}

// PATCH /api/v1/admin/users/:id/status
export async function updateUserStatusHandler(req: Request<{ id: string }>, res: Response): Promise<void> {
  const { status } = req.body as UpdateUserStatusInput;
  const user = await updateUserStatus(req.params.id, status);
  sendSuccess(res, 200, status === "ATIVO" ? "Usuário ativado." : "Usuário desativado.", { user });
}

// GET /api/v1/admin/collections
export async function listCollectionsHandler(req: Request, res: Response): Promise<void> {
  const page = await listCollections(parseInput(adminCollectionsQuerySchema, req.query));
  sendSuccess(res, 200, "Coletas encontradas.", page);
}

// GET /api/v1/admin/collections/:id
export async function getCollectionHandler(req: Request<{ id: string }>, res: Response): Promise<void> {
  const collection = await getCollection(req.params.id);
  sendSuccess(res, 200, "Coleta encontrada.", { collection });
}
