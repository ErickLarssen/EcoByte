# 18 — DEVELOPMENT

## 1. Objetivo

Este documento define como preparar, executar e desenvolver o EcoByte localmente.

Ele cobre:

- pré-requisitos;
- organização do repositório;
- variáveis de ambiente;
- scripts;
- execução local;
- banco de dados local e seed;
- testes;
- convenções de código;
- processo de trabalho.

A publicação em staging/produção é tratada em:

```text
docs/19_DEPLOYMENT.md
```

Este documento deve permanecer alinhado com:

```text
docs/01_ARCHITECTURE.md
docs/17_TESTING.md
docs/19_DEPLOYMENT.md
docs/20_SEED_DATA.md
docs/DECISIONS.md (DEC-021, DEC-061, DEC-062, DEC-063)
```

> Histórico: até 2026-09-24 este arquivo continha uma variante do documento de deployment, duplicando `19_DEPLOYMENT.md`. O conteúdo anterior permanece no histórico do Git.

---

# 2. Pré-requisitos

```text
Node.js 22 LTS
npm (gerenciador único do projeto)
MongoDB local (ou instância de desenvolvimento equivalente)
Git
```

A versão do Node.js deve ser fixada no repositório por:

```text
.nvmrc
campo "engines" do package.json raiz
```

Não utilizar `yarn` ou `pnpm` (`DEC-062`).

---

# 3. Organização do repositório

O projeto é um monorepo com npm workspaces:

```text
Ecobyte/
├── package.json          (workspaces: frontend, backend)
├── package-lock.json     (único lockfile, na raiz)
├── .nvmrc
├── .gitignore
│
├── frontend/             Next.js (App Router) + TypeScript
│   ├── package.json
│   ├── .env.example
│   ├── public/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── data/
│       └── assets/
│
├── backend/              Express + TypeScript + Mongoose
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── models/
│       ├── middlewares/
│       ├── validators/
│       ├── database/
│       │   └── seed/
│       └── config/
│
└── docs/
```

Responsabilidades de cada camada: `docs/01_ARCHITECTURE.md`.

Estrutura de componentes do frontend: `docs/11_COMPONENTS.md`.

---

# 4. Instalação

A partir da raiz:

```bash
npm ci
```

`npm ci` instala as dependências de todos os workspaces a partir do lockfile.

Para adicionar uma dependência a um workspace específico:

```bash
npm install <pacote> --workspace backend
npm install <pacote> --workspace frontend
```

Não criar lockfiles dentro de `frontend/` ou `backend/`.

Novas dependências devem ter necessidade real (`CLAUDE.md` §5). Frameworks ou ferramentas que alterem o stack exigem registro em `DECISIONS.md`.

---

# 5. Variáveis de ambiente

Cada workspace possui seu próprio `.env.example`, versionado e sem segredos.

O arquivo `.env` local é criado a partir do exemplo e nunca é versionado (`DEC-036`, `DEC-037`).

## 5.1 Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/ecobyte
SESSION_SECRET=
SESSION_MAX_AGE=
FRONTEND_URL=http://localhost:3000
```

| Variável | Uso |
|---|---|
| `NODE_ENV` | Ambiente (`development`, `test`, `production`) |
| `PORT` | Porta do Express |
| `MONGODB_URI` | Conexão com o MongoDB |
| `SESSION_SECRET` | Assinatura do cookie de sessão (`DEC-021`) |
| `SESSION_MAX_AGE` | Expiração da sessão; valor definitivo em aberto (`OQ-062`) |
| `FRONTEND_URL` | Origem do frontend para configuração de segurança |

O backend valida as variáveis obrigatórias no startup e interrompe a inicialização com erro claro quando alguma estiver ausente.

## 5.2 Frontend (`frontend/.env`)

```env
API_INTERNAL_URL=http://localhost:4000
```

| Variável | Uso |
|---|---|
| `API_INTERNAL_URL` | Destino do proxy `/api/v1/*` do Next.js (`DEC-063`); lida somente no servidor |

Fora de produção, se `API_INTERNAL_URL` não estiver definida, o proxy usa `http://localhost:4000`. Em produção ela é obrigatória já no `next build` (`docs/19_DEPLOYMENT.md` §6).

Variáveis `NEXT_PUBLIC_*` são expostas ao navegador e nunca devem conter segredos.

---

# 6. Execução local

## 6.1 Portas

```text
frontend (Next.js)  → http://localhost:3000
backend  (Express)  → http://localhost:4000
MongoDB             → mongodb://localhost:27017
```

## 6.2 Fluxo de requisições em desenvolvimento

O navegador acessa somente `http://localhost:3000`.

```text
Navegador → localhost:3000/api/v1/*  → (rewrite Next.js) → localhost:4000/api/v1/*
```

Não chamar `localhost:4000` diretamente a partir do código do navegador: isso quebraria o cookie de sessão first-party (`DEC-063`).

## 6.3 Comandos

```bash
npm run dev                         # frontend + backend (concurrently)
npm run dev --workspace backend     # somente backend
npm run dev --workspace frontend    # somente frontend
```

O backend em desenvolvimento é executado com `tsx` em modo watch.

---

# 7. Scripts

## 7.1 Raiz

| Script | Função |
|---|---|
| `dev` | Executa frontend e backend em desenvolvimento |
| `build` | Build de todos os workspaces |
| `test` | Testes de todos os workspaces |
| `lint` | Lint de todos os workspaces |
| `typecheck` | Verificação de tipos de todos os workspaces |

## 7.2 Backend

| Script | Função |
|---|---|
| `dev` | Express com `tsx` em watch |
| `build` | Compilação TypeScript |
| `start` | Executa o build compilado |
| `test` | Vitest (unitários e integração) |
| `lint` | ESLint (typescript-eslint) |
| `typecheck` | `tsc --noEmit` |
| `seed` | Seed mínimo (`docs/20_SEED_DATA.md`) |
| `seed:full` | Seed completo |

## 7.3 Frontend

| Script | Função |
|---|---|
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `test` | Vitest + Testing Library |
| `test:e2e` | Playwright |
| `lint` | ESLint (eslint-config-next) |
| `typecheck` | `tsc --noEmit` |

Os nomes finais devem corresponder aos `package.json` reais.

---

# 8. Banco de dados local

O MongoDB local utiliza o banco `ecobyte`:

```env
MONGODB_URI=mongodb://localhost:27017/ecobyte
```

Os índices são definidos nos schemas Mongoose (`docs/07_DATABASE_MONGODB.md`).

A coleção `sessions` é criada automaticamente pelo store de sessão (`DEC-021`).

## 8.1 Seed

```bash
npm run seed --workspace backend
```

O seed:

- recria somente dados de desenvolvimento;
- recusa execução com `NODE_ENV=production` (`DEC-034`);
- cria os usuários, o ecoponto e uma coleta em cada estado.

Credenciais de desenvolvimento e estrutura: `docs/20_SEED_DATA.md`.

---

# 9. Testes

Ferramentas (`DEC-062`):

```text
Vitest, Supertest, mongodb-memory-server, Testing Library, Playwright, axe
```

```bash
npm test                                   # todos
npm test --workspace backend               # backend
npm run test:e2e --workspace frontend      # E2E
```

Testes de integração do backend utilizam `mongodb-memory-server`, sem depender do banco local.

O teste de concorrência da aceitação (`DEC-006`) deve rodar contra MongoDB real (memory-server), nunca contra mocks.

Estratégia completa: `docs/17_TESTING.md`.

---

# 10. Convenções de código

## 10.1 TypeScript

- TypeScript em modo `strict` no frontend e no backend;
- evitar `any` sem justificativa.

## 10.2 Nomes

- campos de domínio: português camelCase (`DEC-061`);
- valores de enum: maiúsculas (`PENDENTE`, `CLIENTE`, `PF`);
- nomes de código (models, services, componentes): podem utilizar inglês (`User`, `CollectionService`, `CollectionStatusBadge`).

## 10.3 Fonte única

- status da coleta e transições permitidas definidos em um único módulo do backend (`docs/14_STATE_MACHINE.md` §93–§95);
- o frontend não replica regras de transição: exibe as ações e respeita a resposta da API.

## 10.4 Validação

- entrada da API validada no backend com Zod;
- o frontend pode validar para feedback imediato, sem substituir o backend (`DEC-040`).

## 10.5 Frontend sem regra de negócio

Não implementar regras de negócio em Route Handlers, Server Actions ou equivalentes do Next.js (`CLAUDE.md` §4, `DEC-015`).

---

# 11. Processo de trabalho

Toda tarefa segue (`CLAUDE.md` §12):

```text
Analyze → Plan → Implement → Test → Review → Update Docs
```

Antes de implementar:

1. consultar os documentos relacionados;
2. verificar `DECISIONS.md`;
3. verificar se o tema está em `OPEN_QUESTIONS.md`.

Uma alteração só está concluída quando:

```text
lint, typecheck e testes passam
documentação afetada foi atualizada
decisões novas foram registradas
```

---

# 12. Git

- não versionar `.env`, `node_modules/`, `.next/`, `dist/`, `coverage/`;
- versionar `.env.example` sem valores secretos;
- commits pequenos e descritivos, relacionados a uma única alteração.

---

# 13. Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Login funciona mas `/auth/me` retorna 401 | Requisição feita direto para `:4000` em vez do proxy `:3000` |
| Backend não inicia | Variável obrigatória ausente no `backend/.env` |
| Seed recusa execução | `NODE_ENV=production` |
| Erro de conexão com o banco | MongoDB local não está em execução ou `MONGODB_URI` incorreta |
| Primeiro `npm test` do backend demora vários minutos | Download único do binário do MongoDB (~780 MB) pelo `mongodb-memory-server`, guardado em `~/.cache/mongodb-binaries` |

---

# 14. Fonte de verdade

Decisões de stack, sessão, topologia e nomes:

```text
docs/DECISIONS.md
```

Qualquer mudança nos pré-requisitos, scripts ou estrutura deve atualizar este documento.
