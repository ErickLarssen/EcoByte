import type { Types } from "mongoose";
import type { RecordStatus } from "../domain/constants.js";
import { Ecopoint } from "../models/index.js";
import type { Endereco } from "../models/schemas/endereco.schema.js";
import type { GeoPoint } from "../models/schemas/geo-point.schema.js";
import { AppError } from "../utils/app-error.js";
import type { UpdateEcopointInput } from "../validators/ecopoint.validators.js";

// Representação do ecoponto (06_API §12.1).
export type EcopointView = {
  id: string;
  nome: string;
  descricao: string | null;
  endereco: Endereco;
  localizacao: GeoPoint | null;
  horarios: unknown[];
  status: RecordStatus;
  updatedAt: Date;
};

type EcopointRecord = {
  _id: Types.ObjectId;
  nome: string;
  descricao?: string | null;
  endereco: Endereco;
  localizacao?: GeoPoint | null;
  horarios?: unknown[];
  status: RecordStatus;
  updatedAt: Date;
};

function toView(record: EcopointRecord): EcopointView {
  const { logradouro, numero, complemento, bairro, cidade, estado, cep } = record.endereco;

  return {
    id: String(record._id),
    nome: record.nome,
    descricao: record.descricao ?? null,
    endereco: { logradouro, numero, complemento: complemento ?? null, bairro, cidade, estado, cep },
    localizacao: record.localizacao ? { type: "Point", coordinates: record.localizacao.coordinates } : null,
    horarios: record.horarios ?? [],
    status: record.status,
    updatedAt: record.updatedAt,
  };
}

const notFound = () => new AppError(404, "RESOURCE_NOT_FOUND", "Ecoponto não encontrado.");

// O MVP tem um único ecoponto central (DEC-002): o primeiro cadastrado.
// Ele é consultado mesmo quando INATIVO; o status informa a indisponibilidade (BR-038).
function findCentral() {
  return Ecopoint.findOne().sort({ createdAt: 1, _id: 1 });
}

export async function getCentralEcopoint(): Promise<EcopointView> {
  const record = await findCentral().lean();
  if (!record) throw notFound();
  return toView(record as unknown as EcopointRecord);
}

// Alteração parcial (DEC-065). A coleta referencia o ecoponto por id
// (DEC-053), então editar os dados não altera o vínculo das entregas.
// Com o ecoponto INATIVO, novas entregas falham com ECOPOINT_UNAVAILABLE.
export async function updateCentralEcopoint(input: UpdateEcopointInput): Promise<EcopointView> {
  const central = await findCentral().select("_id").lean();
  if (!central) throw notFound();

  const changes: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(input)) {
    if (value === undefined) continue;
    changes[field] = field === "endereco" ? { ...(value as Endereco), complemento: (value as Endereco).complemento ?? null } : value;
  }

  const updated = await Ecopoint.findByIdAndUpdate(central._id, { $set: changes }, {
    returnDocument: "after",
    runValidators: true,
  }).lean();

  if (!updated) throw notFound();
  return toView(updated as unknown as EcopointRecord);
}
