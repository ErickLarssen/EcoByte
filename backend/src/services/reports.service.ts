import type { PipelineStage } from "mongoose";
import { COLLECTION_STATUSES, type CollectionStatus } from "../domain/collection-status.js";
import { Collection } from "../models/index.js";
import type { ReportsQuery } from "../validators/admin.validators.js";

// Relatórios administrativos (RF-046, DEC-098): agregações do MongoDB
// documentadas em 08_MONGODB_QUERIES §34–§49, executadas numa única
// aggregation com $facet (§48). Todos os indicadores saem do banco; a
// aplicação só converte unidades e completa meses e status sem dados.

// Meses e dias contados no horário de Diadema, não em UTC.
export const REPORT_TIMEZONE = "America/Sao_Paulo";

const HOUR_MS = 60 * 60 * 1000;

// Etapas medidas no tempo médio (§49), na ordem do ciclo de vida (DEC-007).
const STAGES = {
  ateAceite: ["createdAt", "acceptedAt"],
  ateRecolhimento: ["acceptedAt", "collectedAt"],
  ateEntrega: ["collectedAt", "deliveredAt"],
  total: ["createdAt", "completedAt"],
} as const;

type StageKey = keyof typeof STAGES;

export type ReportsView = {
  periodo: { inicio: string | null; fim: string | null };
  resumo: {
    totalColetas: number;
    concluidas: number;
    emAndamento: number;
    pendentes: number;
    itensSolicitados: number;
    itensRecolhidos: number;
    clientesAtendidos: number;
  };
  porStatus: Array<{ status: CollectionStatus; total: number }>;
  porMes: Array<{ ano: number; mes: number; solicitadas: number; concluidas: number }>;
  porCategoria: Array<{ categoria: string; quantidade: number; coletas: number }>;
  porCondicao: Array<{ condicao: string; quantidade: number }>;
  porBairro: Array<{ bairro: string; total: number }>;
  porColetor: Array<{ coletor: { id: string; nome: string }; atendidas: number; concluidas: number }>;
  temposMedios: Record<StageKey, { horas: number | null; coletas: number }>;
};

// Filtro de período pela data da solicitação. `fim` é inclusivo: vai até o
// fim do dia em Diadema (UTC-3, sem horário de verão desde 2019).
function periodMatch({ inicio, fim }: ReportsQuery): PipelineStage[] {
  const createdAt: Record<string, Date> = {};
  if (inicio) createdAt.$gte = new Date(`${inicio}T00:00:00-03:00`);
  if (fim) createdAt.$lte = new Date(`${fim}T23:59:59.999-03:00`);
  return Object.keys(createdAt).length > 0 ? [{ $match: { createdAt } }] : [];
}

const yearMonth = (field: string) => ({
  ano: { $year: { date: `$${field}`, timezone: REPORT_TIMEZONE } },
  mes: { $month: { date: `$${field}`, timezone: REPORT_TIMEZONE } },
});

// Tempo médio de uma etapa (§49): diferença entre dois timestamps, só nas
// coletas que já passaram pelas duas pontas.
const stageAverage = ([from, to]: readonly [string, string]) => [
  { $match: { [from]: { $ne: null }, [to]: { $ne: null } } },
  { $group: { _id: null, mediaMs: { $avg: { $subtract: [`$${to}`, `$${from}`] } }, coletas: { $sum: 1 } } },
];

function buildPipeline(query: ReportsQuery): PipelineStage[] {
  return [
    ...periodMatch(query),
    {
      $facet: {
        // §34: coletas por status.
        porStatus: [{ $group: { _id: "$status", total: { $sum: 1 } } }],

        // Resumo: totais, itens (§21) e clientes distintos.
        resumo: [
          {
            $group: {
              _id: null,
              totalColetas: { $sum: 1 },
              itensSolicitados: { $sum: { $sum: "$itensDescarte.quantidade" } },
              itensRecolhidos: {
                $sum: { $cond: [{ $eq: ["$status", "CONCLUIDA"] }, { $sum: "$itensDescarte.quantidade" }, 0] },
              },
              clientes: { $addToSet: "$usuarioId" },
            },
          },
          { $project: { _id: 0, totalColetas: 1, itensSolicitados: 1, itensRecolhidos: 1, clientesAtendidos: { $size: "$clientes" } } },
        ],

        // §35: coletas solicitadas por mês.
        solicitadasPorMes: [{ $group: { _id: yearMonth("createdAt"), total: { $sum: 1 } } }],

        // §36: coletas concluídas por mês (pela data da conclusão).
        concluidasPorMes: [
          { $match: { status: "CONCLUIDA", completedAt: { $ne: null } } },
          { $group: { _id: yearMonth("completedAt"), total: { $sum: 1 } } },
        ],

        // §37: itens por categoria, desmembrando o array de itens ($unwind).
        porCategoria: [
          { $unwind: "$itensDescarte" },
          {
            $group: {
              _id: "$itensDescarte.categoria",
              quantidade: { $sum: "$itensDescarte.quantidade" },
              coletas: { $addToSet: "$_id" },
            },
          },
          { $project: { quantidade: 1, coletas: { $size: "$coletas" } } },
          { $sort: { quantidade: -1, _id: 1 } },
        ],

        // §38: itens por condição.
        porCondicao: [
          { $unwind: "$itensDescarte" },
          { $group: { _id: "$itensDescarte.condicao", quantidade: { $sum: "$itensDescarte.quantidade" } } },
          { $sort: { quantidade: -1, _id: 1 } },
        ],

        // Bairro do endereço embutido na coleta (07 §18): consulta a um
        // subdocumento, sem junção. Os 10 com mais coletas.
        porBairro: [
          { $group: { _id: "$enderecoColeta.bairro", total: { $sum: 1 } } },
          { $sort: { total: -1, _id: 1 } },
          { $limit: 10 },
        ],

        // §40 + §42: coletas por coletor, com o nome via $lookup em users.
        porColetor: [
          { $match: { coletorId: { $ne: null } } },
          {
            $group: {
              _id: "$coletorId",
              atendidas: { $sum: 1 },
              concluidas: { $sum: { $cond: [{ $eq: ["$status", "CONCLUIDA"] }, 1, 0] } },
            },
          },
          { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "coletor" } },
          { $unwind: "$coletor" },
          { $project: { atendidas: 1, concluidas: 1, nome: "$coletor.nome" } },
          { $sort: { atendidas: -1, nome: 1 } },
        ],

        // §49: tempo médio de cada etapa.
        ...Object.fromEntries(Object.entries(STAGES).map(([key, fields]) => [`tempo_${key}`, stageAverage(fields)])),
      },
    },
  ];
}

type FacetResult = {
  porStatus: Array<{ _id: CollectionStatus; total: number }>;
  resumo: Array<{ totalColetas: number; itensSolicitados: number; itensRecolhidos: number; clientesAtendidos: number }>;
  solicitadasPorMes: Array<{ _id: { ano: number; mes: number }; total: number }>;
  concluidasPorMes: Array<{ _id: { ano: number; mes: number }; total: number }>;
  porCategoria: Array<{ _id: string; quantidade: number; coletas: number }>;
  porCondicao: Array<{ _id: string; quantidade: number }>;
  porBairro: Array<{ _id: string; total: number }>;
  porColetor: Array<{ _id: unknown; atendidas: number; concluidas: number; nome: string }>;
} & Record<`tempo_${StageKey}`, Array<{ mediaMs: number; coletas: number }>>;

const ACTIVE: CollectionStatus[] = ["ACEITA", "A_CAMINHO", "RECOLHIDA", "ENTREGUE_ECOPONTO"];

export async function buildReports(query: ReportsQuery): Promise<ReportsView> {
  const [facet] = await Collection.aggregate<FacetResult>(buildPipeline(query));
  const statusTotals = new Map(facet!.porStatus.map((row) => [row._id, row.total]));
  const count = (statuses: CollectionStatus[]) => statuses.reduce((sum, status) => sum + (statusTotals.get(status) ?? 0), 0);
  const resumo = facet!.resumo[0];

  // Meses: união das duas séries, em ordem cronológica.
  const months = new Map<string, { ano: number; mes: number; solicitadas: number; concluidas: number }>();
  const monthEntry = ({ ano, mes }: { ano: number; mes: number }) => {
    const key = `${ano}-${String(mes).padStart(2, "0")}`;
    if (!months.has(key)) months.set(key, { ano, mes, solicitadas: 0, concluidas: 0 });
    return months.get(key)!;
  };
  for (const row of facet!.solicitadasPorMes) monthEntry(row._id).solicitadas = row.total;
  for (const row of facet!.concluidasPorMes) monthEntry(row._id).concluidas = row.total;

  return {
    periodo: { inicio: query.inicio ?? null, fim: query.fim ?? null },
    resumo: {
      totalColetas: resumo?.totalColetas ?? 0,
      concluidas: count(["CONCLUIDA"]),
      emAndamento: count(ACTIVE),
      pendentes: count(["PENDENTE"]),
      itensSolicitados: resumo?.itensSolicitados ?? 0,
      itensRecolhidos: resumo?.itensRecolhidos ?? 0,
      clientesAtendidos: resumo?.clientesAtendidos ?? 0,
    },
    // Todos os status aparecem, mesmo com zero, na ordem do ciclo de vida.
    porStatus: COLLECTION_STATUSES.map((status) => ({ status, total: statusTotals.get(status) ?? 0 })),
    porMes: [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value),
    porCategoria: facet!.porCategoria.map((row) => ({ categoria: row._id, quantidade: row.quantidade, coletas: row.coletas })),
    porCondicao: facet!.porCondicao.map((row) => ({ condicao: row._id, quantidade: row.quantidade })),
    porBairro: facet!.porBairro.map((row) => ({ bairro: row._id, total: row.total })),
    porColetor: facet!.porColetor.map((row) => ({
      coletor: { id: String(row._id), nome: row.nome },
      atendidas: row.atendidas,
      concluidas: row.concluidas,
    })),
    temposMedios: Object.fromEntries(
      (Object.keys(STAGES) as StageKey[]).map((key) => {
        const row = facet![`tempo_${key}`][0];
        return [key, { horas: row ? Math.round((row.mediaMs / HOUR_MS) * 10) / 10 : null, coletas: row?.coletas ?? 0 }];
      }),
    ) as ReportsView["temposMedios"],
  };
}
