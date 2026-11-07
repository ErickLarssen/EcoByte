"use client";

import { AlertCircle, ChartColumn } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { DetailSection, DetailSkeleton } from "@/components/common/detail-parts";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminReports } from "@/hooks/use-admin";
import type { AdminReports, ReportPeriod, ReportStage } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { STATUS_INFO } from "@/lib/collection-status";
import { formatLabel, formatQuantity } from "@/lib/format";

// Relatórios administrativos (RF-046, DEC-098). Os números vêm prontos das
// agregações do MongoDB; a tela só os apresenta.
//
// Gráficos (guia de visualização de dados): barras horizontais finas, numa só
// cor por gráfico, com o valor escrito na ponta, em cor de texto. A lista de
// valores é a própria tabela acessível de cada gráfico. O gráfico mensal tem
// duas séries, com legenda; as cores (--chart-1 e --chart-2) foram validadas
// para daltonismo e visão normal.

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const monthLabel = (ano: number, mes: number) => `${MONTHS[mes - 1]}/${ano}`;

// Horas até 48; acima disso, dias (ex.: "2,3 h", "3,5 dias").
function formatDuration(hours: number): string {
  const format = (value: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value);
  return hours < 48 ? `${format(hours)} h` : `${format(hours / 24)} dias`;
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="grid content-start gap-1 surface-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

type BarItem = { key: string; label: string; value: number; detail?: string };

// Barras horizontais: 12px, ponta arredondada e base reta, valor na ponta.
function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const width = max > 0 ? (value / max) * 100 : 0;
  return (
    <div aria-hidden="true" className="h-3 rounded-r-sm bg-muted/60">
      {value > 0 && <div className="h-3 min-w-0.5 rounded-r-sm" style={{ width: `${width}%`, backgroundColor: color }} />}
    </div>
  );
}

function BarList({ items, label, unit }: { items: BarItem[]; label: string; unit: (value: number) => string }) {
  const max = Math.max(0, ...items.map((item) => item.value));
  if (items.length === 0) return <p className="text-sm text-muted-foreground">Sem dados no período.</p>;

  return (
    <ul aria-label={label} className="grid gap-3">
      {items.map((item) => (
        <li key={item.key} className="grid gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{item.label}</span>
            <span className="shrink-0 font-medium tabular-nums">
              {unit(item.value)}
              {item.detail && <span className="font-normal text-muted-foreground"> · {item.detail}</span>}
            </span>
          </div>
          <Bar value={item.value} max={max} color="var(--chart-1)" />
        </li>
      ))}
    </ul>
  );
}

const SERIES = [
  { key: "solicitadas", label: "Solicitadas", color: "var(--chart-1)" },
  { key: "concluidas", label: "Concluídas", color: "var(--chart-2)" },
] as const;

// Duas séries por mês: legenda sempre visível e valor escrito ao lado de cada
// barra, para a identidade não depender só da cor.
function MonthChart({ months }: { months: AdminReports["porMes"] }) {
  if (months.length === 0) return <p className="text-sm text-muted-foreground">Sem dados no período.</p>;
  const max = Math.max(0, ...months.flatMap((month) => [month.solicitadas, month.concluidas]));

  return (
    <div className="grid gap-4">
      <ul aria-label="Legenda" className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {SERIES.map((series) => (
          <li key={series.key} className="flex items-center gap-2">
            <span aria-hidden="true" className="size-3 rounded-sm" style={{ backgroundColor: series.color }} />
            {series.label}
          </li>
        ))}
      </ul>
      <ul aria-label="Coletas por mês" className="grid gap-4">
        {months.map((month) => (
          <li key={`${month.ano}-${month.mes}`} className="grid gap-1.5">
            <p className="text-sm font-medium">{monthLabel(month.ano, month.mes)}</p>
            {SERIES.map((series) => (
              <div key={series.key} className="grid grid-cols-[1fr_auto] items-center gap-3">
                <Bar value={month[series.key]} max={max} color={series.color} />
                <span className="w-28 text-right text-sm tabular-nums">
                  {month[series.key]} <span className="text-muted-foreground">{series.label.toLowerCase()}</span>
                </span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CollectorTable({ rows }: { rows: AdminReports["porColetor"] }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">Nenhuma coleta aceita no período.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Coletas por coletor</caption>
        <thead className="border-b text-muted-foreground">
          <tr>
            <th scope="col" className="py-2 pr-4 font-medium">Coletor</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">Atendidas</th>
            <th scope="col" className="py-2 text-right font-medium">Concluídas</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.coletor.id}>
              <th scope="row" className="py-2 pr-4 font-normal">{row.coletor.nome}</th>
              <td className="py-2 pr-4 text-right tabular-nums">{row.atendidas}</td>
              <td className="py-2 text-right tabular-nums">{row.concluidas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const STAGE_LABELS: Array<{ key: keyof AdminReports["temposMedios"]; label: string }> = [
  { key: "ateAceite", label: "Da solicitação ao aceite" },
  { key: "ateRecolhimento", label: "Do aceite ao recolhimento" },
  { key: "ateEntrega", label: "Do recolhimento à entrega no ecoponto" },
  { key: "total", label: "Da solicitação à conclusão" },
];

function stageMetric(stage: ReportStage) {
  if (stage.horas === null) return { value: "Sem dados", hint: "Nenhuma coleta passou por esta etapa." };
  return { value: formatDuration(stage.horas), hint: `Média de ${stage.coletas} ${stage.coletas === 1 ? "coleta" : "coletas"}` };
}

// Período pela URL (?inicio=&fim=), para o relatório poder ser compartilhado.
function PeriodFilter({ period, apiError }: { period: ReportPeriod; apiError: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const startId = useId();
  const endId = useId();
  const [inicio, setInicio] = useState(period.inicio ?? "");
  const [fim, setFim] = useState(period.fim ?? "");
  const [error, setError] = useState<string | null>(null);

  function apply(next: { inicio: string; fim: string }) {
    const params = new URLSearchParams();
    if (next.inicio) params.set("inicio", next.inicio);
    if (next.fim) params.set("fim", next.fim);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (inicio && fim && inicio > fim) {
      setError("A data final deve ser igual ou posterior à inicial.");
      return;
    }
    setError(null);
    apply({ inicio, fim });
  }

  function clear() {
    setInicio("");
    setFim("");
    setError(null);
    apply({ inicio: "", fim: "" });
  }

  const message = error ?? apiError;

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Período do relatório" className="grid gap-3 surface-card p-4">
      <p className="text-sm text-muted-foreground">
        Período da solicitação. Sem datas, o relatório considera todas as coletas.
      </p>
      {message && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
        <FormField id={startId} label="De">
          <Input type="date" value={inicio} onChange={(event) => setInicio(event.target.value)} />
        </FormField>
        <FormField id={endId} label="Até">
          <Input type="date" value={fim} onChange={(event) => setFim(event.target.value)} />
        </FormField>
        <Button type="submit">Aplicar</Button>
        <Button type="button" variant="outline" onClick={clear}>
          Limpar
        </Button>
      </div>
    </form>
  );
}

export function AdminReports() {
  const searchParams = useSearchParams();
  const period: ReportPeriod = { inicio: searchParams.get("inicio"), fim: searchParams.get("fim") };
  const query = useAdminReports(period);

  const apiError =
    query.error instanceof ApiError && query.error.code === "VALIDATION_ERROR"
      ? (Object.values(query.error.fields)[0] ?? query.error.message)
      : null;

  return (
    <div className="grid gap-5">
      <PeriodFilter key={`${period.inicio}-${period.fim}`} period={period} apiError={apiError} />

      {query.isPending && <DetailSkeleton label="Gerando relatórios..." />}

      {query.isError && !apiError && (
        <ErrorState
          title="Não foi possível gerar os relatórios."
          message="Verifique sua conexão e tente novamente."
          onRetry={() => void query.refetch()}
          retrying={query.isFetching}
        />
      )}

      {query.data && <ReportsBody data={query.data} busy={query.isPlaceholderData} />}
    </div>
  );
}

function ReportsBody({ data, busy }: { data: AdminReports; busy: boolean }) {
  const { resumo } = data;

  if (resumo.totalColetas === 0) {
    return <EmptyState icon={ChartColumn} title="Nenhuma coleta no período." description="Ajuste as datas ou limpe o filtro." />;
  }

  return (
    <div className="grid gap-5" aria-busy={busy || undefined}>
      <section aria-label="Resumo" className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Metric label="Coletas solicitadas" value={formatQuantity(resumo.totalColetas)} />
        <Metric label="Concluídas" value={formatQuantity(resumo.concluidas)} />
        <Metric label="Em andamento" value={formatQuantity(resumo.emAndamento)} hint="Aceitas e ainda não concluídas" />
        <Metric label="Aguardando coletor" value={formatQuantity(resumo.pendentes)} />
        <Metric
          label="Itens recolhidos"
          value={formatQuantity(resumo.itensRecolhidos)}
          hint={`de ${formatQuantity(resumo.itensSolicitados)} solicitados`}
        />
        <Metric label="Clientes atendidos" value={formatQuantity(resumo.clientesAtendidos)} />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <DetailSection title="Coletas por status">
          <BarList
            label="Coletas por status"
            unit={formatQuantity}
            items={data.porStatus.map((row) => ({ key: row.status, label: STATUS_INFO[row.status].label, value: row.total }))}
          />
        </DetailSection>

        <DetailSection title="Coletas por mês">
          <MonthChart months={data.porMes} />
        </DetailSection>

        <DetailSection title="Itens por categoria">
          <BarList
            label="Itens por categoria"
            unit={(value) => `${formatQuantity(value)} ${value === 1 ? "item" : "itens"}`}
            items={data.porCategoria.map((row) => ({
              key: row.categoria,
              label: formatLabel(row.categoria),
              value: row.quantidade,
              detail: `${row.coletas} ${row.coletas === 1 ? "coleta" : "coletas"}`,
            }))}
          />
        </DetailSection>

        <DetailSection title="Itens por condição">
          <BarList
            label="Itens por condição"
            unit={(value) => `${formatQuantity(value)} ${value === 1 ? "item" : "itens"}`}
            items={data.porCondicao.map((row) => ({ key: row.condicao, label: formatLabel(row.condicao), value: row.quantidade }))}
          />
        </DetailSection>

        <DetailSection title="Bairros com mais coletas">
          <BarList
            label="Bairros com mais coletas"
            unit={formatQuantity}
            items={data.porBairro.map((row) => ({ key: row.bairro, label: row.bairro, value: row.total }))}
          />
        </DetailSection>

        <DetailSection title="Coletas por coletor">
          <CollectorTable rows={data.porColetor} />
        </DetailSection>
      </div>

      <DetailSection title="Tempo médio de cada etapa">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STAGE_LABELS.map(({ key, label }) => {
            const metric = stageMetric(data.temposMedios[key]);
            return <Metric key={key} label={label} value={metric.value} hint={metric.hint} />;
          })}
        </div>
      </DetailSection>
    </div>
  );
}
