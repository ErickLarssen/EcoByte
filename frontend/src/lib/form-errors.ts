import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";
import { ApiError } from "./api/client";

export type ApiFieldResolver<T extends FieldValues> = (apiField: string) => FieldPath<T> | undefined;

// Leva os erros de campo da API (error.fields, DEC-017) para o formulário.
// `resolveField` traduz o caminho da API (ex.: "dadosEmpresa.razaoSocial",
// "itensDescarte.0.quantidade") para o campo do formulário, ou undefined.
// Retorna a mensagem geral a exibir, quando houver, e os campos marcados.
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  resolveField: ApiFieldResolver<T>,
): { message: string | null; fields: FieldPath<T>[] } {
  if (!(error instanceof ApiError)) {
    return { message: "Não foi possível realizar a operação. Tente novamente.", fields: [] };
  }

  const fields: FieldPath<T>[] = [];

  for (const [apiField, message] of Object.entries(error.fields)) {
    const formField = resolveField(apiField);

    if (formField) {
      setError(formField, { type: "server", message }, { shouldFocus: fields.length === 0 });
      fields.push(formField);
    }
  }

  const message = fields.length > 0 && error.code === "VALIDATION_ERROR" ? null : error.message;
  return { message, fields };
}
