"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { AddressFields } from "@/components/common/address-fields";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCreateCollection } from "@/hooks/use-client-collections";
import type { CreateCollectionPayload } from "@/lib/api/collections";
import { applyApiErrors } from "@/lib/form-errors";
import { SERVICE_AREA } from "@/lib/service-area";
import {
  EMPTY_ITEM,
  collectionRequestSchema,
  type CollectionRequestInput,
  type CollectionRequestValues,
} from "@/lib/validation/collection";
import { CollectionReview } from "./collection-review";
import { REQUEST_STEPS, RequestSteps } from "./request-steps";
import { WasteItemsFields } from "./waste-items-fields";

// Campos validados em cada etapa antes de avançar.
const STEP_FIELDS: FieldPath<CollectionRequestInput>[][] = [["enderecoColeta"], ["itensDescarte"], ["observacoes"]];

const STEP_TITLES = ["Onde retirar o material?", "O que será descartado?", "Revise e confirme"] as const;

// Campos da API que existem no formulário (mesmos caminhos: DEC-061).
function resolveApiField(apiField: string): FieldPath<CollectionRequestInput> | undefined {
  return /^(enderecoColeta|itensDescarte|observacoes)(\.|$)/.test(apiField)
    ? (apiField as FieldPath<CollectionRequestInput>)
    : undefined;
}

function stepOfField(field: string): number {
  if (field.startsWith("enderecoColeta")) return 0;
  if (field.startsWith("itensDescarte")) return 1;
  return 2;
}

function toPayload(values: CollectionRequestValues): CreateCollectionPayload {
  const { complemento, ...endereco } = values.enderecoColeta;

  return {
    enderecoColeta: { ...endereco, ...(complemento ? { complemento } : {}) },
    itensDescarte: values.itensDescarte,
    ...(values.observacoes ? { observacoes: values.observacoes } : {}),
  };
}

// Solicitação de coleta em etapas (11 §64, DEC-073): Endereço → Itens → Revisão.
// Sem agendamento enquanto OQ-020 estiver aberta.
export function CollectionRequestForm() {
  const router = useRouter();
  const createCollection = useCreateCollection();
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [cepRejection, setCepRejection] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const form = useForm<CollectionRequestInput, unknown, CollectionRequestValues>({
    resolver: zodResolver(collectionRequestSchema),
    mode: "onTouched",
    defaultValues: {
      // Cidade e UF fixas na área de atendimento (DEC-081).
      enderecoColeta: {
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: SERVICE_AREA.cidade,
        estado: SERVICE_AREA.estado,
      },
      itensDescarte: [{ ...EMPTY_ITEM }],
      observacoes: "",
    },
  });

  // Ao trocar de etapa, o foco vai para o título, para leitores de tela
  // e teclado acompanharem a mudança de conteúdo (12 §55).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  async function goNext() {
    const valid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });

    // CEP recusado na consulta (fora de Diadema-SP ou inexistente, DEC-081):
    // a validação do formulário não conhece o CEP, então o bloqueio é feito aqui.
    if (valid && step === 0 && cepRejection) {
      form.setError("enderecoColeta.cep", { type: "cep", message: cepRejection }, { shouldFocus: true });
      return;
    }

    if (valid) setStep((current) => current + 1);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);

    try {
      const collection = await createCollection.mutateAsync(toPayload(values));
      router.push(`/cliente/coletas/${collection.id}?nova=1`);
    } catch (error) {
      const { message, fields } = applyApiErrors(error, form.setError, resolveApiField);
      setFormError(message);

      // Volta para a etapa do primeiro campo recusado pela API.
      if (fields.length > 0) setStep(Math.min(...fields.map(stepOfField)));
    }
  });

  const isLastStep = step === REQUEST_STEPS.length - 1;

  // Nas etapas intermediárias, o envio do formulário (botão "Continuar" ou
  // Enter num campo) apenas valida e avança; a solicitação só é enviada na revisão.
  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    if (!isLastStep) {
      event.preventDefault();
      void goNext();
      return;
    }
    void onSubmit(event);
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleFormSubmit} method="post" noValidate aria-label="Solicitar coleta" className="grid gap-6">
        <RequestSteps current={step} />

        <div className="grid gap-5 rounded-xl border bg-card p-4 sm:p-6">
          <h2 ref={headingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
            {STEP_TITLES[step]}
          </h2>

          {formError && (
            <Alert variant="destructive">
              <AlertCircle aria-hidden="true" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {step === 0 && <AddressFields name="enderecoColeta" serviceArea onCepRejected={setCepRejection} />}
          {step === 1 && <WasteItemsFields />}
          {step === 2 && <CollectionReview onEditStep={setStep} />}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <Button type="button" variant="outline" size="lg" onClick={() => setStep((current) => current - 1)}>
              <ArrowLeft aria-hidden="true" data-icon="inline-start" />
              Voltar
            </Button>
          ) : (
            <span aria-hidden="true" />
          )}

          {isLastStep ? (
            <Button type="submit" size="lg" loading={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Enviando..." : "Confirmar solicitação"}
            </Button>
          ) : (
            // Submit do formulário: o Enter nos campos também avança (handleFormSubmit).
            <Button type="submit" size="lg">
              Continuar
              <ArrowRight aria-hidden="true" data-icon="inline-end" />
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
