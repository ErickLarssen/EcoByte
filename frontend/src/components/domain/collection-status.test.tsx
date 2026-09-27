import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { COLLECTION_STATUSES, STATUS_INFO, type CollectionStatus } from "@/lib/collection-status";
import { buildCollection } from "@/test/utils";
import { CollectionStatusBadge } from "./collection-status-badge";
import { CollectionTimeline } from "./collection-timeline";

const LABELS: Record<CollectionStatus, string> = {
  PENDENTE: "Pendente",
  ACEITA: "Aceita",
  A_CAMINHO: "A caminho",
  RECOLHIDA: "Recolhida",
  ENTREGUE_ECOPONTO: "Entregue no ecoponto",
  CONCLUIDA: "Concluída",
};

describe("CollectionStatusBadge (17_TESTING §71)", () => {
  it.each(COLLECTION_STATUSES)("%s tem texto legível, não apenas cor", (status) => {
    render(<CollectionStatusBadge status={status} />);

    const badge = screen.getByText(LABELS[status]);
    expect(badge).toHaveAttribute("data-status", status);
  });

  it("usa a definição central de status (11 §125)", () => {
    for (const status of COLLECTION_STATUSES) {
      expect(STATUS_INFO[status].label).toBe(LABELS[status]);
    }
  });
});

describe("CollectionTimeline (17_TESTING §72)", () => {
  const timestamps = {
    acceptedAt: "2026-09-20T14:00:00.000Z",
    startedAt: "2026-09-20T15:00:00.000Z",
    collectedAt: "2026-09-20T16:00:00.000Z",
    deliveredAt: "2026-09-20T17:00:00.000Z",
    completedAt: "2026-09-20T18:00:00.000Z",
  };

  it.each(COLLECTION_STATUSES.map((status, index) => [status, index] as const))(
    "em %s: etapas anteriores concluídas, atual marcada e futuras pendentes",
    (status, index) => {
      render(<CollectionTimeline collection={buildCollection({ status, ...timestamps })} />);

      const steps = within(screen.getByRole("list", { name: "Andamento da coleta" })).getAllByRole("listitem");
      expect(steps).toHaveLength(6);

      steps.forEach((step, position) => {
        const expected = position < index ? "completed" : position === index ? "current" : "upcoming";
        expect(step).toHaveAttribute("data-state", expected);
        expect(step.getAttribute("aria-current")).toBe(position === index ? "step" : null);
      });
    },
  );

  it("mostra o horário das etapas concluídas e da atual", () => {
    render(
      <CollectionTimeline
        collection={buildCollection({ status: "A_CAMINHO", acceptedAt: timestamps.acceptedAt, startedAt: timestamps.startedAt })}
      />,
    );

    const times = screen.getAllByText((_, element) => element?.tagName === "TIME");
    expect(times.map((time) => time.getAttribute("datetime"))).toEqual([
      "2026-09-20T13:00:00.000Z",
      timestamps.acceptedAt,
      timestamps.startedAt,
    ]);
    expect(screen.getByText(/O coletor está a caminho do endereço\./)).toBeInTheDocument();
  });
});
