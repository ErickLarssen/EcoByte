import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";
import { ApiError } from "./api/client";

// Leva os erros de campo da API (error.fields, DEC-017) para o formulário.
// `fieldMap` traduz caminhos da API (ex.: "dadosEmpresa.razaoSocial") para os
// nomes dos campos do formulário. Retorna a mensagem geral, quando houver.
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fieldMap: Partial<Record<string, FieldPath<T>>>,
  knownFields: readonly FieldPath<T>[],
): string | null {
  if (!(error instanceof ApiError)) {
    return "Não foi possível realizar a operação. Tente novamente.";
  }

  let mappedAny = false;

  for (const [apiField, message] of Object.entries(error.fields)) {
    const formField = fieldMap[apiField] ?? (knownFields.includes(apiField as FieldPath<T>) ? (apiField as FieldPath<T>) : undefined);

    if (formField) {
      setError(formField, { type: "server", message }, { shouldFocus: !mappedAny });
      mappedAny = true;
    }
  }

  return mappedAny && error.code === "VALIDATION_ERROR" ? null : error.message;
}
