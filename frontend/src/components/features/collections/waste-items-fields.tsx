"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CATEGORY_SUGGESTIONS, CONDITION_SUGGESTIONS } from "@/lib/collection-suggestions";
import { EMPTY_ITEM, type CollectionRequestInput } from "@/lib/validation/collection";

// Etapa de itens (11 §66): adicionar, editar e remover itens. Categoria e
// condição aceitam texto livre com sugestões provisórias (DEC-073).
export function WasteItemsFields() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CollectionRequestInput>();
  const { fields, append, remove } = useFieldArray({ control, name: "itensDescarte" });
  const listError = errors.itensDescarte?.root?.message ?? errors.itensDescarte?.message;

  return (
    <div className="grid gap-4">
      <datalist id="categorias-sugeridas">
        {CATEGORY_SUGGESTIONS.map((option) => (
          <option key={option.value} value={option.value} label={option.label} />
        ))}
      </datalist>
      <datalist id="condicoes-sugeridas">
        {CONDITION_SUGGESTIONS.map((option) => (
          <option key={option.value} value={option.value} label={option.label} />
        ))}
      </datalist>

      <ul className="grid gap-4" aria-label="Itens da coleta">
        {fields.map((field, index) => {
          const itemErrors = errors.itensDescarte?.[index];

          return (
            <li key={field.id} className="grid gap-4 rounded-xl border bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">Item {index + 1}</p>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    aria-label={`Remover item ${index + 1}`}
                  >
                    <Trash2 aria-hidden="true" data-icon="inline-start" />
                    Remover
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_1fr_8rem]">
                <FormField
                  id={`item-${index}-categoria`}
                  label="Categoria"
                  required
                  description="Ex.: informática, celulares, cabos."
                  error={itemErrors?.categoria?.message}
                >
                  <Input list="categorias-sugeridas" autoComplete="off" {...register(`itensDescarte.${index}.categoria`)} />
                </FormField>

                <FormField
                  id={`item-${index}-condicao`}
                  label="Condição"
                  required
                  description="Ex.: usado, danificado, obsoleto."
                  error={itemErrors?.condicao?.message}
                >
                  <Input list="condicoes-sugeridas" autoComplete="off" {...register(`itensDescarte.${index}.condicao`)} />
                </FormField>

                <FormField
                  id={`item-${index}-quantidade`}
                  label="Quantidade"
                  required
                  description="Em unidades."
                  error={itemErrors?.quantidade?.message}
                >
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    {...register(`itensDescarte.${index}.quantidade`, { valueAsNumber: true })}
                  />
                </FormField>
              </div>
            </li>
          );
        })}
      </ul>

      {listError && <FieldError>{listError}</FieldError>}

      <Button type="button" variant="outline" onClick={() => append({ ...EMPTY_ITEM })} className="justify-self-start">
        <Plus aria-hidden="true" data-icon="inline-start" />
        Adicionar outro item
      </Button>
    </div>
  );
}
