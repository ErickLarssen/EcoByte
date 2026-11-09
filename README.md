# EcoByte

[![CI](https://github.com/ErickLarssen/EcoByte/actions/workflows/ci.yml/badge.svg)](https://github.com/ErickLarssen/EcoByte/actions/workflows/ci.yml)

Plataforma de coleta de lixo eletrônico em **Diadema-SP**. O cliente solicita a coleta pelo site, um coletor da equipe EcoByte recolhe o material no endereço informado e o leva ao **ecoponto EcoByte**, e o cliente acompanha cada etapa até a conclusão.

Projeto acadêmico full-stack, construído com documentação primeiro: regras, decisões e questões em aberto ficam em [`docs/`](docs/).

## Sistema publicado

| Parte | Endereço |
|---|---|
| Site | https://eco-byte-neon.vercel.app |
| API (verificação de saúde) | https://ecobyte-api-rp3e.onrender.com/api/v1/health |

> A API usa o plano gratuito do Render, que "dorme" após 15 minutos sem uso. O primeiro acesso depois disso leva cerca de 1 minuto.

## Funcionalidades

**Cliente** (pessoa física ou jurídica)
- Cadastro com confirmação de e-mail, login e recuperação de senha por link.
- Solicitação de coleta em etapas: endereço preenchido pelo CEP, restrito a Diadema-SP, e itens de descarte.
- Acompanhamento de cada coleta, com a linha do tempo das etapas e notificações.
- Perfil com "Baixar meus dados" e "Excluir minha conta" (LGPD).

**Coletor**
- Painel com as coletas disponíveis e as em andamento.
- Fluxo operacional: aceitar, iniciar rota, recolher, entregar no ecoponto e concluir. A máquina de estados é validada no servidor.
- "Como chegar" ao endereço da coleta e ao ecoponto, histórico de coletas concluídas e aviso de nova coleta.

**Administrador**
- Painel com totais, usuários e coletas.
- Cadastro de coletores com senha provisória, que deve ser trocada no primeiro acesso.
- Ativação e desativação de usuários, edição do ecoponto e registro de auditoria das ações sensíveis.
- **Relatórios** com agregações do MongoDB (`$facet`, `$unwind`, `$lookup`, `$group`):
  - coletas por status, mês, bairro e coletor;
  - itens por categoria e condição;
  - tempo médio de cada etapa, com filtro de período.

**Site institucional**
- Páginas Sobre o Projeto, Ecoponto, Solicitar Coleta, Como Funciona e Política de Privacidade.

## Arquitetura

```text
Navegador ──HTTPS──▶ Frontend (Next.js, Vercel)
                         │  proxy de /api/v1/* (mesma origem: cookie de sessão first-party)
                         ▼
                     Backend (Express, Render) ──▶ MongoDB Atlas
```

- **Frontend:** apresentação e navegação, sem regra de negócio.
- **Backend:** a API Express é a única fonte das regras, da autenticação, das permissões e das transições de status.
- **Sessão:** fica no servidor, num cookie `HttpOnly`. Nada sensível vai para o `localStorage`.

Detalhes em [`docs/01_ARCHITECTURE.md`](docs/01_ARCHITECTURE.md).

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Radix), Lucide, TanStack Query, React Hook Form, Zod |
| Backend | Node.js 22, Express 5, TypeScript, Mongoose 9, Zod, express-session + connect-mongo, Argon2id, Nodemailer |
| Banco | MongoDB (Atlas em produção), com índices geoespaciais `2dsphere`, TTL e únicos |
| Testes | Vitest, Testing Library, Supertest e MongoDB em memória (`mongodb-memory-server`) |
| Infraestrutura | Vercel (frontend), Render (backend), MongoDB Atlas, GitHub Actions e Dependabot |

## Segurança e privacidade

- **Senhas e tokens:** senhas com Argon2id; tokens de e-mail e de redefinição guardados só como hash.
- **Sessões:** sessões no servidor, com o cookie `__Host-` em produção. Trocar a senha encerra as demais sessões, e a sessão do administrador expira após 30 minutos sem uso.
- **Limites contra abuso:** por IP e por conta; 10 senhas erradas bloqueiam o e-mail por 15 minutos.
- **Cabeçalhos:** CSP estrita com nonce, HSTS e `Cache-Control: no-store` nas respostas da API.
- **Autorização:** sempre no backend. Uma coleta de outro usuário responde 404, e campos não previstos são descartados.
- **LGPD:** política de privacidade, exportação dos dados, exclusão com anonimização e auditoria sem dados pessoais.
- **Dependências:** auditoria de vulnerabilidades no CI e atualizações semanais pelo Dependabot.

Detalhes em [`docs/09_AUTHENTICATION_SECURITY.md`](docs/09_AUTHENTICATION_SECURITY.md) e nas decisões DEC-090 a DEC-096.

## Como rodar localmente

### Pré-requisitos
- Node.js 22 (versão em [`.nvmrc`](.nvmrc)) e npm
- MongoDB rodando em `mongodb://localhost:27017`
- Git

### Passo a passo

```bash
# 1. Clonar e instalar (monorepo com npm workspaces, um único lockfile)
git clone https://github.com/ErickLarssen/EcoByte.git
cd EcoByte
npm ci

# 2. Criar os arquivos de ambiente a partir dos exemplos
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

No `backend/.env`, preencha `SESSION_SECRET` com pelo menos 32 caracteres. Para gerar um valor:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Sem `SMTP_HOST`, os e-mails (confirmação e redefinição de senha) aparecem no console do backend.

```bash
# 3. Popular o banco local com dados de demonstração (apaga o banco local)
npm run seed --workspace backend

# 4. Subir frontend e backend juntos
npm run dev
```

O site abre em **http://localhost:3000**, e a API fica em http://localhost:4000. O navegador acessa só a porta 3000; o Next.js repassa `/api/v1/*` ao backend.

### Contas de demonstração (somente no banco local)

Criadas pelo seed. **Não existem em produção**: lá, o primeiro administrador é criado pelo `npm run bootstrap`.

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | admin@ecobyte.local | SenhaAdmin123! |
| Cliente (pessoa física) | mariana@ecobyte.local | ClientePF123! |
| Cliente (pessoa jurídica) | empresa@ecobyte.local | ClientePJ123! |
| Coletor | coletor@ecobyte.local | Coletor123! |

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Frontend e backend em modo de desenvolvimento |
| `npm test` | Testes dos dois workspaces |
| `npm run lint` / `npm run typecheck` | Lint e verificação de tipos |
| `npm run build` | Build de produção dos dois workspaces |
| `npm run seed --workspace backend` | Dados de demonstração. **Apaga o banco** e é bloqueado em produção |
| `npm run bootstrap --workspace backend` | Banco novo: cria o primeiro administrador e o ecoponto, sem apagar nada |
| `npm run purge --workspace backend` | Remove definitivamente perfis listados em `PURGE_EMAILS`. Só simula, a não ser com `PURGE_CONFIRMAR=APAGAR` |

## Testes e integração contínua

- **Backend:** testes de API com Supertest contra um MongoDB real em memória (autenticação, permissões, máquina de estados, segurança, LGPD).
- **Frontend:** testes de componentes com Testing Library e uma API simulada.
- **CI (GitHub Actions):** a cada pull request, roda auditoria de dependências, lint, typecheck, testes e build. O deploy do backend só acontece com o CI aprovado.

Estratégia em [`docs/17_TESTING.md`](docs/17_TESTING.md).

## Deploy

Frontend na Vercel, backend no Render (configurado por [`render.yaml`](render.yaml)) e banco no MongoDB Atlas. O passo a passo, com a inicialização do banco e o teste após o deploy, está em [`docs/19_DEPLOYMENT.md`](docs/19_DEPLOYMENT.md) §21.2.

## Estrutura do repositório

```text
EcoByte/
├── frontend/            Next.js (App Router)
│   └── src/
│       ├── app/         páginas e layouts (site, autenticação, cliente, coletor, admin)
│       ├── components/  ui (shadcn), common, domain, features, layouts
│       ├── hooks/       consultas e mutações (TanStack Query)
│       ├── lib/         cliente da API, validações, navegação, cabeçalhos de segurança
│       └── proxy.ts     CSP com nonce por requisição
├── backend/             API Express
│   ├── src/
│   │   ├── routes/ controllers/ services/   rotas → controle → regras de negócio
│   │   ├── models/ validators/ middlewares/ Mongoose, Zod, autenticação e segurança
│   │   ├── domain/      máquina de estados da coleta
│   │   └── database/    seed, bootstrap e purge
│   └── tests/
├── docs/                documentação do projeto (fonte da verdade)
├── .github/             CI e Dependabot
└── render.yaml          configuração do backend no Render
```

## Documentação

| Documento | Conteúdo |
|---|---|
| [00 Visão geral](docs/00_PROJECT_OVERVIEW.md) | Objetivo, perfis e escopo |
| [01 Arquitetura](docs/01_ARCHITECTURE.md) · [02 Domínio](docs/02_DOMAIN_MODEL.md) | Camadas e entidades |
| [03 Regras de negócio](docs/03_BUSINESS_RULES.md) · [04 Requisitos](docs/04_REQUIREMENTS.md) | O que o sistema deve fazer |
| [05 Rotas](docs/05_ROUTES.md) · [06 API](docs/06_API.md) | Contrato da API |
| [07 Banco](docs/07_DATABASE_MONGODB.md) · [08 Consultas](docs/08_MONGODB_QUERIES.md) | Modelagem e consultas no MongoDB |
| [09 Segurança](docs/09_AUTHENTICATION_SECURITY.md) | Autenticação, autorização e proteção de dados |
| [10 Design system](docs/10_DESIGN_SYSTEM.md) · [11 Componentes](docs/11_COMPONENTS.md) · [12 Responsividade](docs/12_RESPONSIVENESS_ACCESSIBILITY.md) | Interface |
| [13 Fluxo do coletor](docs/13_COLLECTOR_FLOW.md) · [14 Máquina de estados](docs/14_STATE_MACHINE.md) | Operação da coleta |
| [15 Interações](docs/15_INTERACTIONS_MOTION.md) · [16 Assets](docs/16_ASSETS.md) | Movimento e recursos visuais |
| [17 Testes](docs/17_TESTING.md) · [18 Desenvolvimento](docs/18_DEVELOPMENT.md) · [19 Deploy](docs/19_DEPLOYMENT.md) · [20 Seed](docs/20_SEED_DATA.md) | Operação do projeto |
| [Decisões](docs/DECISIONS.md) · [Questões em aberto](docs/OPEN_QUESTIONS.md) | Registro de decisões (DEC) e pontos sem definição (OQ) |
| [Avaliação heurística (IHC)](docs/entregas/IHC_AVALIACAO_HEURISTICA.md) | Diagnóstico de usabilidade com as 10 heurísticas de Nielsen |

## Autoria

Desenvolvido por [@ErickLarssen](https://github.com/ErickLarssen).
