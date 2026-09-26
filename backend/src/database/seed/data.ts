import type { CollectionStatus } from "../../domain/collection-status.js";
import type { TipoCadastro, UserRole } from "../../domain/constants.js";

// Dados fictícios do seed mínimo (20_SEED_DATA §3–§20, DEC-034, DEC-035).
// Nenhum dado real: e-mails .local, endereços e coordenadas de demonstração.

export type SeedUserKey = "admin" | "clientePF" | "clientePJ" | "coletor";

export type SeedUser = {
  key: SeedUserKey;
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  tipoCadastro: TipoCadastro;
  dadosEmpresa?: { razaoSocial: string; nomeFantasia: string };
};

// Credenciais exclusivas de desenvolvimento (20_SEED_DATA §34).
export const SEED_USERS: readonly SeedUser[] = [
  {
    key: "admin",
    nome: "Administrador EcoByte",
    email: "admin@ecobyte.local",
    senha: "SenhaAdmin123!",
    role: "ADMIN",
    tipoCadastro: "PF",
  },
  {
    key: "clientePF",
    nome: "Mariana Oliveira",
    email: "mariana@ecobyte.local",
    senha: "ClientePF123!",
    role: "CLIENTE",
    tipoCadastro: "PF",
  },
  {
    key: "clientePJ",
    nome: "Tech Verde Soluções",
    email: "empresa@ecobyte.local",
    senha: "ClientePJ123!",
    role: "CLIENTE",
    tipoCadastro: "PJ",
    dadosEmpresa: { razaoSocial: "Tech Verde Soluções Ltda.", nomeFantasia: "Tech Verde Soluções" },
  },
  {
    key: "coletor",
    nome: "Carlos Mendes",
    email: "coletor@ecobyte.local",
    senha: "Coletor123!",
    role: "COLETOR",
    tipoCadastro: "PF",
  },
];

// Ecoponto central fictício (20_SEED_DATA §7; endereço real em aberto: OQ-003, OQ-004).
export const SEED_ECOPOINT = {
  nome: "Ecoponto Central EcoByte",
  descricao: "Centro de recebimento e destinação de resíduos eletrônicos da EcoByte.",
  status: "ATIVO" as const,
  endereco: {
    logradouro: "Avenida EcoByte",
    numero: "100",
    complemento: null,
    bairro: "Centro",
    cidade: "Diadema",
    estado: "SP",
    cep: "09900000",
  },
  localizacao: {
    type: "Point" as const,
    coordinates: [-46.6228, -23.6812],
  },
};

export type SeedCollection = {
  status: CollectionStatus;
  cliente: Extract<SeedUserKey, "clientePF" | "clientePJ">;
  // Horas antes da execução do seed em que a coleta foi criada.
  createdHoursAgo: number;
  enderecoColeta: {
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  itensDescarte: Array<{ categoria: string; quantidade: number; condicao: string }>;
};

// Uma coleta por status (20_SEED_DATA §9–§15, distribuição de §22).
// Categorias e condições são provisórias (OQ-007, OQ-010).
export const SEED_COLLECTIONS: readonly SeedCollection[] = [
  {
    status: "PENDENTE",
    cliente: "clientePF",
    createdHoursAgo: 1,
    enderecoColeta: {
      logradouro: "Rua das Palmeiras",
      numero: "120",
      complemento: "Casa 2",
      bairro: "Centro",
      cidade: "Diadema",
      estado: "SP",
      cep: "09900001",
    },
    itensDescarte: [
      { categoria: "INFORMATICA", quantidade: 2, condicao: "USADO" },
      { categoria: "ELETRONICOS", quantidade: 1, condicao: "DANIFICADO" },
    ],
  },
  {
    status: "ACEITA",
    cliente: "clientePF",
    createdHoursAgo: 24,
    enderecoColeta: {
      logradouro: "Rua Verde",
      numero: "250",
      complemento: null,
      bairro: "Jardim Eco",
      cidade: "Diadema",
      estado: "SP",
      cep: "09900002",
    },
    itensDescarte: [{ categoria: "INFORMATICA", quantidade: 1, condicao: "USADO" }],
  },
  {
    status: "A_CAMINHO",
    cliente: "clientePJ",
    createdHoursAgo: 48,
    enderecoColeta: {
      logradouro: "Avenida Tecnologia",
      numero: "500",
      complemento: "Bloco A",
      bairro: "Distrito Industrial",
      cidade: "Diadema",
      estado: "SP",
      cep: "09900003",
    },
    itensDescarte: [
      { categoria: "INFORMATICA", quantidade: 8, condicao: "OBSOLETO" },
      { categoria: "PERIFERICOS", quantidade: 12, condicao: "USADO" },
    ],
  },
  {
    status: "RECOLHIDA",
    cliente: "clientePF",
    createdHoursAgo: 72,
    enderecoColeta: {
      logradouro: "Rua dos Eletrônicos",
      numero: "80",
      complemento: null,
      bairro: "Vila Nova",
      cidade: "Diadema",
      estado: "SP",
      cep: "09900004",
    },
    itensDescarte: [
      { categoria: "CELULARES", quantidade: 4, condicao: "DANIFICADO" },
      { categoria: "PERIFERICOS", quantidade: 3, condicao: "USADO" },
    ],
  },
  {
    status: "ENTREGUE_ECOPONTO",
    cliente: "clientePJ",
    createdHoursAgo: 120,
    enderecoColeta: {
      logradouro: "Avenida Sustentável",
      numero: "900",
      complemento: null,
      bairro: "Distrito Industrial",
      cidade: "Diadema",
      estado: "SP",
      cep: "09900006",
    },
    itensDescarte: [
      { categoria: "MONITORES", quantidade: 2, condicao: "DANIFICADO" },
      { categoria: "INFORMATICA", quantidade: 5, condicao: "OBSOLETO" },
    ],
  },
  {
    status: "CONCLUIDA",
    cliente: "clientePF",
    createdHoursAgo: 240,
    enderecoColeta: {
      logradouro: "Rua da Reciclagem",
      numero: "45",
      complemento: null,
      bairro: "Centro",
      cidade: "Diadema",
      estado: "SP",
      cep: "09900005",
    },
    itensDescarte: [
      { categoria: "COMPUTADORES", quantidade: 2, condicao: "OBSOLETO" },
      { categoria: "CABOS", quantidade: 10, condicao: "USADO" },
    ],
  },
];

export type SeedNotification = {
  destinatario: SeedUserKey;
  // Coleta relacionada, identificada pelo status no seed mínimo.
  coleta: CollectionStatus;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
};

// Notificações de demonstração (20_SEED_DATA §20). Tipos oficiais em aberto (OQ-013);
// os valores abaixo seguem a proposta inicial registrada na própria OQ-013.
export const SEED_NOTIFICATIONS: readonly SeedNotification[] = [
  {
    destinatario: "clientePF",
    coleta: "PENDENTE",
    tipo: "COLETA_CRIADA",
    titulo: "Coleta solicitada",
    mensagem: "Sua solicitação de coleta foi registrada com sucesso.",
    lida: false,
  },
  {
    destinatario: "coletor",
    coleta: "PENDENTE",
    tipo: "NOVA_COLETA",
    titulo: "Nova coleta disponível",
    mensagem: "Uma nova coleta está disponível para atendimento.",
    lida: false,
  },
  {
    destinatario: "clientePF",
    coleta: "ACEITA",
    tipo: "COLETA_ACEITA",
    titulo: "Coleta aceita",
    mensagem: "Um coletor EcoByte aceitou a sua coleta.",
    lida: false,
  },
  {
    destinatario: "coletor",
    coleta: "ACEITA",
    tipo: "NOVA_COLETA",
    titulo: "Nova coleta disponível",
    mensagem: "Uma nova coleta está disponível para atendimento.",
    lida: true,
  },
  {
    destinatario: "clientePJ",
    coleta: "A_CAMINHO",
    tipo: "COLETA_A_CAMINHO",
    titulo: "Coletor a caminho",
    mensagem: "O coletor está a caminho do endereço da coleta.",
    lida: false,
  },
  {
    destinatario: "clientePF",
    coleta: "RECOLHIDA",
    tipo: "COLETA_RECOLHIDA",
    titulo: "Material recolhido",
    mensagem: "O material da sua coleta foi recolhido.",
    lida: true,
  },
  {
    destinatario: "clientePJ",
    coleta: "ENTREGUE_ECOPONTO",
    tipo: "COLETA_ENTREGUE_ECOPONTO",
    titulo: "Entregue no ecoponto",
    mensagem: "O material da sua coleta foi entregue no ecoponto EcoByte.",
    lida: true,
  },
  {
    destinatario: "clientePF",
    coleta: "CONCLUIDA",
    tipo: "COLETA_CONCLUIDA",
    titulo: "Coleta concluída",
    mensagem: "Sua coleta foi concluída. Obrigado por descartar corretamente!",
    lida: true,
  },
];
