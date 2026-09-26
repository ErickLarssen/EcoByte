// Valores de enum do domínio (DEC-061: valores em maiúsculas).

// Papel operacional (BR-001, DEC-003).
export const USER_ROLES = ["CLIENTE", "COLETOR", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Tipo cadastral, independente da role (BR-002, BR-003).
export const TIPOS_CADASTRO = ["PF", "PJ"] as const;
export type TipoCadastro = (typeof TIPOS_CADASTRO)[number];

// Desativação lógica de usuários e do ecoponto (BR-008, BR-038, DEC-024).
export const RECORD_STATUSES = ["ATIVO", "INATIVO"] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];
