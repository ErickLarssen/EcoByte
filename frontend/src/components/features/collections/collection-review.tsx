"use client";

import { Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FormField } from "@/components/common/form-field";
import { AddressCard } from "@/components/domain/address-card";
import { WasteItemsList } from "@/components/domain/waste-items-list";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { collectionRequestSchema, type CollectionRequestInput } from "@/lib/validation/collection";

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <section className="grid gap-3" aria-label={title}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit} aria-label={`Editar ${title.toLowerCase()}`}>
          <Pencil aria-hidden="true" data-icon="inline-start" />
          Editar
        </Button>
      </div>
      {children}
    </section>
  );
}

// Revisão antes do envio (11 §67). Mostra os dados já normalizados como
// serão enviados (ex.: CEP sem hífen, UF em maiúsculas).
export function CollectionReview({ onEditStep }: { onEditStep: (step: number) => void }) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CollectionRequestInput>();
  const values = useWatch({ control });
  const parsed = collectionRequestSchema.safeParse(values);

  if (!parsed.success) return null;

  return (
    <div className="grid gap-6">
      <ReviewSection title="Endereço" onEdit={() => onEditStep(0)}>
        <div className="rounded-xl border bg-background p-4">
          <AddressCard address={parsed.data.enderecoColeta} />
        </div>
      </ReviewSection>

      <ReviewSection title="Itens" onEdit={() => onEditStep(1)}>
        <WasteItemsList items={parsed.data.itensDescarte} />
      </ReviewSection>

      <FormField
        id="observacoes"
        label="Observações"
        description="Opcional. Informações que ajudem o coletor, como ponto de referência ou melhor horário."
        error={errors.observacoes?.message}
      >
        <Textarea maxLength={1000} rows={3} {...register("observacoes")} />
      </FormField>
    </div>
  );
}
