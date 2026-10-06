"use client";

import { useEffect, useRef, useState } from "react";
import { get, useFormContext, useWatch, type FieldError } from "react-hook-form";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { lookupCep } from "@/lib/api/cep";
import { ApiError } from "@/lib/api/client";
import { OUTSIDE_SERVICE_AREA_MESSAGE, SERVICE_AREA } from "@/lib/service-area";

type AddressFieldsProps = {
  // Caminho do endereço no formulário (ex.: "enderecoColeta", "endereco").
  name: string;
  // Cidade e UF fixas na área de atendimento, Diadema-SP (DEC-081).
  serviceArea?: boolean;
  // Avisa quando o CEP consultado é recusado (inexistente ou fora da área), ou
  // null quando volta a ser aceitável; o formulário pode impedir o avanço.
  onCepRejected?: (message: string | null) => void;
};

type AddressField = "cep" | "numero" | "logradouro" | "complemento" | "bairro" | "cidade" | "estado";

type LookupState = { kind: "idle" } | { kind: "loading" } | { kind: "info"; message: string };

// Campos de endereço (11 §65 AddressForm), compartilhados pela solicitação de
// coleta e pelo ecoponto. O CEP preenche logradouro e bairro (DEC-081). Uma
// coluna no celular; a partir de md, pares "CEP | Número" e "Cidade | Estado" (12 §19).
export function AddressFields({ name, serviceArea = false, onCepRejected }: AddressFieldsProps) {
  const {
    control,
    register,
    setValue,
    setError,
    clearErrors,
    setFocus,
    formState: { errors },
  } = useFormContext();
  const path = (field: AddressField) => `${name}.${field}`;
  const error = (field: AddressField) => (get(errors, path(field)) as FieldError | undefined)?.message;

  const cep = (useWatch({ control, name: path("cep") }) as string | undefined) ?? "";
  const [lookup, setLookup] = useState<LookupState>({ kind: "idle" });
  // CEP já consultado, para não repetir a busca sem mudança.
  const lastLooked = useRef(cep.replace(/\D/g, ""));

  useEffect(() => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8 || digits === lastLooked.current) return;
    lastLooked.current = digits;

    const controller = new AbortController();
    setLookup({ kind: "loading" });
    onCepRejected?.(null);

    lookupCep(digits, controller.signal)
      .then((address) => {
        if (serviceArea && !address.atendido) {
          setError(path("cep"), { type: "service-area", message: OUTSIDE_SERVICE_AREA_MESSAGE });
          onCepRejected?.(OUTSIDE_SERVICE_AREA_MESSAGE);
          setLookup({ kind: "idle" });
          return;
        }

        clearErrors(path("cep"));
        const options = { shouldDirty: true, shouldValidate: true };
        if (address.logradouro) setValue(path("logradouro"), address.logradouro, options);
        if (address.bairro) setValue(path("bairro"), address.bairro, options);
        if (!serviceArea) {
          setValue(path("cidade"), address.cidade, options);
          setValue(path("estado"), address.estado, options);
        }
        setLookup({ kind: "info", message: "Endereço preenchido pelo CEP. Confira e informe o número." });
        setFocus(path("numero"));
      })
      .catch((failure: unknown) => {
        if (failure instanceof DOMException && failure.name === "AbortError") return;
        if (failure instanceof ApiError && failure.status === 404) {
          setError(path("cep"), { type: "not-found", message: "CEP não encontrado." });
          onCepRejected?.("CEP não encontrado.");
          setLookup({ kind: "idle" });
          return;
        }
        // Serviço indisponível: segue com preenchimento manual.
        setLookup({ kind: "info", message: "Não foi possível buscar o CEP agora. Preencha o endereço manualmente." });
      });

    return () => controller.abort();
    // path é derivado de name; as funções do formulário são estáveis.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cep, name, serviceArea]);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <FormField
        id="cep"
        label="CEP"
        required
        error={error("cep")}
        description={
          lookup.kind === "loading" ? "Buscando endereço..." : lookup.kind === "info" ? lookup.message : undefined
        }
      >
        <Input inputMode="numeric" autoComplete="postal-code" maxLength={9} {...register(path("cep"))} />
      </FormField>

      <FormField id="numero" label="Número" required error={error("numero")}>
        <Input {...register(path("numero"))} />
      </FormField>

      <div className="md:col-span-2">
        <FormField id="logradouro" label="Logradouro" required error={error("logradouro")}>
          <Input autoComplete="address-line1" {...register(path("logradouro"))} />
        </FormField>
      </div>

      <FormField id="complemento" label="Complemento" error={error("complemento")}>
        <Input autoComplete="address-line2" {...register(path("complemento"))} />
      </FormField>

      <FormField id="bairro" label="Bairro" required error={error("bairro")}>
        <Input autoComplete="address-level3" {...register(path("bairro"))} />
      </FormField>

      <FormField
        id="cidade"
        label="Cidade"
        required
        error={error("cidade")}
        description={serviceArea ? `Atendemos apenas ${SERVICE_AREA.cidade}-${SERVICE_AREA.estado}.` : undefined}
      >
        <Input autoComplete="address-level2" readOnly={serviceArea} {...register(path("cidade"))} />
      </FormField>

      <FormField id="estado" label="Estado (UF)" required error={error("estado")}>
        <Input
          autoComplete="address-level1"
          maxLength={2}
          readOnly={serviceArea}
          className="uppercase"
          {...register(path("estado"))}
        />
      </FormField>
    </div>
  );
}
