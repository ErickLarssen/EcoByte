"use client";

import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import type { CollectionRequestInput } from "@/lib/validation/collection";

// Etapa de endereço (11 §65). Uma coluna no celular; a partir de md, pares
// "CEP | Número" e "Cidade | Estado" (12 §19). O endereço vira um retrato
// histórico da coleta (DEC-008).
export function AddressFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CollectionRequestInput>();
  const fieldErrors = errors.enderecoColeta;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <FormField id="cep" label="CEP" required error={fieldErrors?.cep?.message}>
        <Input inputMode="numeric" autoComplete="postal-code" maxLength={9} {...register("enderecoColeta.cep")} />
      </FormField>

      <FormField id="numero" label="Número" required error={fieldErrors?.numero?.message}>
        <Input {...register("enderecoColeta.numero")} />
      </FormField>

      <div className="md:col-span-2">
        <FormField id="logradouro" label="Logradouro" required error={fieldErrors?.logradouro?.message}>
          <Input autoComplete="address-line1" {...register("enderecoColeta.logradouro")} />
        </FormField>
      </div>

      <FormField id="complemento" label="Complemento" error={fieldErrors?.complemento?.message}>
        <Input autoComplete="address-line2" {...register("enderecoColeta.complemento")} />
      </FormField>

      <FormField id="bairro" label="Bairro" required error={fieldErrors?.bairro?.message}>
        <Input autoComplete="address-level3" {...register("enderecoColeta.bairro")} />
      </FormField>

      <FormField id="cidade" label="Cidade" required error={fieldErrors?.cidade?.message}>
        <Input autoComplete="address-level2" {...register("enderecoColeta.cidade")} />
      </FormField>

      <FormField id="estado" label="Estado (UF)" required error={fieldErrors?.estado?.message}>
        <Input
          autoComplete="address-level1"
          maxLength={2}
          className="uppercase"
          {...register("enderecoColeta.estado")}
        />
      </FormField>
    </div>
  );
}
