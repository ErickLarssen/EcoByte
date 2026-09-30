"use client";

import { get, useFormContext, type FieldError } from "react-hook-form";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";

type AddressFieldsProps = {
  // Caminho do endereço no formulário (ex.: "enderecoColeta", "endereco").
  name: string;
};

type AddressField = "cep" | "numero" | "logradouro" | "complemento" | "bairro" | "cidade" | "estado";

// Campos de endereço (11 §65 AddressForm), compartilhados pela solicitação de
// coleta e pelo ecoponto. Uma coluna no celular; a partir de md, pares
// "CEP | Número" e "Cidade | Estado" (12 §19).
export function AddressFields({ name }: AddressFieldsProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const path = (field: AddressField) => `${name}.${field}`;
  const error = (field: AddressField) => (get(errors, path(field)) as FieldError | undefined)?.message;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <FormField id="cep" label="CEP" required error={error("cep")}>
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

      <FormField id="cidade" label="Cidade" required error={error("cidade")}>
        <Input autoComplete="address-level2" {...register(path("cidade"))} />
      </FormField>

      <FormField id="estado" label="Estado (UF)" required error={error("estado")}>
        <Input autoComplete="address-level1" maxLength={2} className="uppercase" {...register(path("estado"))} />
      </FormField>
    </div>
  );
}
