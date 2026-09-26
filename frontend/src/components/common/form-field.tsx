import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

type ControlProps = {
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
};

type FormFieldProps = {
  id: string;
  label: ReactNode;
  required?: boolean;
  description?: ReactNode;
  error?: string;
  // Um único controle (Input, PasswordInput...), que recebe id e atributos ARIA.
  children: ReactElement<ControlProps>;
  // Conteúdo exibido abaixo do controle (ex.: lista de requisitos da senha).
  after?: ReactNode;
};

// Estrutura padronizada de campo (11 §15): label, controle, descrição e erro.
// Associa descrição e erro ao controle (12 §47–§52) e marca obrigatoriedade
// com texto, não apenas com cor (12 §49).
export function FormField({ id, label, required, description, error, children, after }: FormFieldProps) {
  const descriptionId = description ? `${id}-descricao` : undefined;
  const errorId = error ? `${id}-erro` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        "aria-required": required || undefined,
      })
    : children;

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </FieldLabel>
      {control}
      {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
      {after}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  );
}
