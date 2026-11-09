# Desenvolvimento Web III — Arquitetura do back-end, HTTP e request/response

**Projeto:** EcoByte, plataforma de coleta de lixo eletrônico em Diadema-SP
**Back-end:** Node.js 22 + **Express 5** + TypeScript, com MongoDB (Mongoose)
**Sistema publicado:** https://eco-byte-neon.vercel.app (API: https://ecobyte-api-rp3e.onrender.com/api/v1/health)
**Apêndice:** [trocas HTTP reais capturadas da API](web3/trocas-http.md)

---

## 1. Introdução

O EcoByte liga três perfis:
- o **cliente**, que solicita a coleta do lixo eletrônico;
- o **coletor**, que recolhe o material e o leva ao ecoponto;
- o **administrador**, que acompanha a operação.

Toda a interação entre essas pessoas e o sistema acontece por **requisições HTTP** a uma API Express. Cada clique relevante na tela vira um pedido ao servidor, que aplica as regras de negócio, consulta ou altera o banco e devolve uma resposta.

Este documento explica:
1. **qual estrutura** o back-end adota e **por quê**;
2. **como ela se apoia no protocolo HTTP**: métodos, códigos de status, cabeçalhos, cookies e ausência de estado;
3. **como as chamadas de request/response sustentam o funcionamento** do projeto, com exemplos reais capturados da API.

---

## 2. Visão geral

```text
 Navegador (cliente, coletor, admin)
        │  HTTPS — só fala com a origem do site
        ▼
 Frontend Next.js (Vercel)
        │  proxy: /api/v1/*  ──►  repassa a requisição sem alterar
        ▼
 API Express (Render)                 ◄── regras de negócio, autenticação,
        │  Mongoose                        autorização, validação
        ▼
 MongoDB (Atlas)
```

**O frontend cuida só da apresentação.** Ele não decide nada sobre permissões, status ou validade dos dados (`DEC-015`). Toda decisão está na API Express, a única porta de entrada para os dados.

---

## 3. Por que essa estrutura

### 3.1 Por que Express

- **O modelo do Express é o modelo do HTTP.** Uma aplicação Express é uma sequência de *middlewares*, funções que recebem a requisição (`req`), podem responder (`res`) ou passar adiante (`next`). Isso corresponde ao ciclo de vida de uma requisição HTTP: chega, é inspecionada (cabeçalhos, cookie, corpo), é autorizada e validada, é processada e recebe uma resposta. Cada responsabilidade vira uma etapa explícita e reutilizável.
- **Mínimo e explícito.** O Express não impõe estrutura nem esconde o protocolo. Métodos, rotas, status e cabeçalhos aparecem no código, o que é bom para um projeto que precisa ser **explicável**.
- **Express 5.** Erros lançados em funções assíncronas chegam sozinhos ao tratador central de erros, sem `try/catch` em cada rota.
- **Ecossistema maduro** para o que o projeto exige:
  - `express-session`, para sessão no servidor;
  - `connect-mongo`, para guardar a sessão no próprio MongoDB;
  - `express-rate-limit`, para limitar tentativas.

### 3.2 Arquitetura em camadas

Cada requisição atravessa camadas com responsabilidades separadas:

| Camada | Responsabilidade | Exemplo no código |
|---|---|---|
| **Rotas** | Mapear *método + URL* para a sequência de middlewares e o controller | `routes/collection.routes.ts`: `router.post("/:id/accept", requireRole("COLETOR"), collectorAction("accept"))` |
| **Middlewares** | Etapas transversais: segurança, sessão, autenticação, autorização, validação, limites | `middlewares/authenticate.ts`, `authorize.ts`, `validate-body.ts`, `rate-limit.ts` |
| **Controllers** | Traduzir HTTP ↔ domínio: ler `req`, chamar o serviço, escolher o **status** e montar a resposta | `controllers/collection.controller.ts` |
| **Services** | Regras de negócio, sem nenhum conhecimento de HTTP | `services/collection.service.ts` (máquina de estados, aceite atômico) |
| **Models / Validators** | Estrutura e integridade dos dados (Mongoose) e dos corpos recebidos (Zod) | `models/collection.model.ts`, `validators/collection.validators.ts` |

**Por que separar assim:**
- **Testabilidade.** A aplicação é montada por `createApp()` sem abrir porta nem conectar ao banco. Os **376 testes automatizados** do back-end fazem requisições HTTP de verdade contra ela (Supertest) e um MongoDB em memória, e conferem status, cabeçalhos e corpo de cada resposta.
- **As regras não dependem do HTTP.** O serviço que aceita uma coleta não sabe o que é `req` ou `res`. A mesma regra poderia ser chamada por outro tipo de cliente sem mudança.
- **Segurança na fronteira.** Autenticação, autorização e validação acontecem **antes** de qualquer regra de negócio rodar. Uma requisição inválida ou sem permissão nunca chega ao banco.
- **Um formato de resposta único.** Controllers e o tratador de erros usam as mesmas funções (`sendSuccess`, `sendError`), então todo cliente da API recebe respostas previsíveis (seção 5.6).

### 3.3 API separada, acessada pela mesma origem

O frontend (Next.js) e a API (Express) são aplicações separadas, publicadas em lugares diferentes. Mesmo assim, o navegador **só conversa com a origem do site**: o Next.js repassa tudo que começa com `/api/v1/` para a API (`DEC-063`).

- **O cookie de sessão é do próprio site** (*first-party*). Com `SameSite=Lax`, isso dificulta ataques de outros sites, sem depender de cookies de terceiros, que os navegadores bloqueiam cada vez mais.
- **Não há CORS para configurar.** Para o navegador, as chamadas à API são da mesma origem.

### 3.4 Alternativas descartadas

- **Regras de negócio no Next.js (*Route Handlers* ou *Server Actions*).** Foi descartado nas regras do projeto (`CLAUDE.md` §4). As regras ficariam espalhadas entre duas aplicações, e a disciplina pede um back-end estruturado em Express.
- **Um `PATCH /collections/:id/status` genérico.** Foi substituído por **um endpoint de ação por transição** (`POST /:id/accept`, `/start`, `/collect`, `/deliver`, `/complete`, `DEC-064`). Cada ação tem sua regra, sua permissão e sua notificação, e o cliente da API não escolhe livremente o próximo status: isso impede, por construção, pular etapas.

---

## 4. O caminho de uma requisição

A ordem dos middlewares em `app.ts` define o que acontece com toda requisição, nesta sequência:

| # | Etapa | O que faz | Resposta se falhar |
|---|---|---|---|
| 1 | `securityHeaders` | Acrescenta cabeçalhos de segurança a **toda** resposta, inclusive erros: `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, CSP | — |
| 2 | `createOriginGuard` | Em métodos que alteram estado (POST, PUT, PATCH, DELETE), recusa o cabeçalho `Origin` de outro site, como complemento contra CSRF (`DEC-069`) | `403 INVALID_ORIGIN` |
| 3 | `express.json({ limit: "100kb" })` | Interpreta o corpo JSON, com limite de tamanho | `400` (JSON inválido) ou `413` (corpo grande demais) |
| 4 | sessão (`express-session` + `connect-mongo`) | Lê o cookie, busca a sessão no MongoDB e a renova | — |
| 5 | roteador `/api/v1` | Escolhe a rota pelo **método** e pela **URL** | `404 RESOURCE_NOT_FOUND` |
| 6 | limite de tentativas (algumas rotas) | Conta tentativas por IP: login, cadastro, recuperação de senha | `429 RATE_LIMIT_EXCEEDED` |
| 7 | `requireAuth` | Exige sessão válida e usuário ativo | `401 UNAUTHORIZED` ou `403 USER_INACTIVE` |
| 8 | `requireRole` | Confere o perfil, como `COLETOR` | `403 FORBIDDEN` |
| 9 | `validateBody` | Valida o corpo com Zod e descarta campos não previstos | `400 VALIDATION_ERROR`, com erro por campo |
| 10 | controller → service → Mongoose | Executa a regra e lê ou grava no MongoDB | `404`, `409` ou `422`, conforme a regra |
| 11 | `sendSuccess` | Responde com o **status** adequado e o envelope padrão | — |
| — | `errorHandler` | Converte qualquer erro no envelope padrão, sem expor detalhes internos | `500 INTERNAL_SERVER_ERROR` |

Um exemplo concreto: quando o coletor toca em "Aceitar coleta", a requisição `POST /api/v1/collections/:id/accept`:
1. ganha os cabeçalhos de segurança;
2. passa pela checagem de origem;
3. tem a sessão carregada;
4. é roteada;
5. tem a sessão confirmada (`requireAuth`) e o perfil conferido (`COLETOR`);
6. só então executa a transição no banco.

---

## 5. O protocolo HTTP na prática

### 5.1 Recursos e URLs

- Tudo fica sob **`/api/v1`**. A versão na URL permite evoluir a API sem quebrar clientes antigos (`DEC-016`).
- **URLs nomeiam recursos**, com substantivos no plural:
  - `/collections` (coletas) e `/collections/:id` (uma coleta);
  - `/notifications`, `/profile`, `/admin/users`, `/admin/reports`.
- **Transições de estado são sub-recursos de ação:** `/collections/:id/accept`. Uma transição não é uma simples alteração de campo: ela dispara regras, notificações e registros de data (seção 3.4).

### 5.2 Métodos e sua semântica

| Método | Uso no EcoByte | Seguro? | Idempotente? |
|---|---|---|---|
| `GET` | Ler: listar coletas, ver detalhe, notificações, relatórios | Sim, não altera nada | Sim |
| `POST` | Criar recurso (`/collections`, `/admin/users`) e **executar ações** (`/auth/login`, `/collections/:id/accept`) | Não | **Não.** Repetir um aceite responde `409`, porque a ação já aconteceu |
| `PATCH` | Alteração parcial (`/profile`, `/admin/users/:id/status`, `/notifications/:id/read`) | Não | Sim, na prática: repetir o mesmo status responde `200` sem efeito novo |
| `DELETE` | Excluir a própria conta (`/profile`), com a senha no corpo | Não | Sim: depois de excluída, a sessão não existe mais |

**Por que isso importa:** como `GET` nunca altera dados, o navegador pode repetir uma leitura (por exemplo, a cada 60 segundos para checar notificações) sem risco. Tudo o que muda dados passa por métodos que a checagem de origem (seção 4, etapa 2) protege.

### 5.3 Códigos de status

A API usa o código HTTP para dizer **o que aconteceu**, e o corpo traz um código interno para dizer **o motivo**. Todos os casos abaixo foram capturados da API real ([apêndice](web3/trocas-http.md)):

| Status | Significado | Exemplo no EcoByte | Apêndice |
|---|---|---|---|
| `200 OK` | Sucesso | Login, leitura de coleta, aceite pelo coletor | §2, §6, §11 |
| `201 Created` | Recurso criado | Nova solicitação de coleta (`POST /collections`) | §4 |
| `400 Bad Request` | Dados inválidos | Solicitação sem endereço nem itens, com o erro de **cada campo** | §3 |
| `401 Unauthorized` | Sem sessão válida | `/auth/me` sem cookie e cookie reaproveitado depois do logout | §2, §12 |
| `403 Forbidden` | Autenticado, mas sem permissão | Cliente pedindo `/admin/users` e requisição vinda de outro site | §5 |
| `404 Not Found` | Recurso inexistente **ou de outra pessoa** | Cliente pedindo a coleta de outro cliente: o servidor não revela que ela existe | §10 |
| `409 Conflict` | Conflito com o estado atual | Coleta já aceita por outro coletor | §7, §8 |
| `422 Unprocessable Entity` | Requisição válida, mas a regra não permite | Concluir uma coleta que ainda está `ACEITA` (transição inválida) | §9 |
| `429 Too Many Requests` | Excesso de tentativas | 10 tentativas de login em 15 minutos pelo mesmo IP, com `Retry-After` | §13 |
| `500 Internal Server Error` | Falha inesperada | Mensagem genérica, sem detalhes internos | — |

**`400` versus `422`:** o `400` diz que a requisição está **malformada**, por exemplo um CEP com 3 dígitos. O `422` diz que ela está **bem formada, mas proibida pela regra**, como concluir antes de recolher. **`401` versus `403`:** o `401` significa "não sei quem é você"; o `403` significa "sei quem é você, e você não pode fazer isso".

### 5.4 Cabeçalhos

| Cabeçalho | Direção | Papel no EcoByte |
|---|---|---|
| `Content-Type: application/json` | ida e volta | O corpo é JSON. A API só interpreta JSON, com limite de 100 kB |
| `Cookie` / `Set-Cookie` | ida / volta | Identificador da sessão: `HttpOnly` (scripts não leem), `SameSite=Lax`, `Path=/`. Em produção: `Secure` e prefixo `__Host-` |
| `Origin` | ida | O navegador informa de qual site veio a requisição, e a API recusa outros sites em operações de escrita |
| `Cache-Control: no-store` | volta | Respostas com dados pessoais **nunca** ficam em cache do navegador, de proxies ou da CDN |
| `X-Content-Type-Options`, `Content-Security-Policy` | volta | O navegador não reinterpreta o JSON e nada da API é executado ou embutido em página |
| `RateLimit-Policy`, `RateLimit`, `Retry-After` | volta | Quantas tentativas restam (`r=9`) e, quando bloqueado, em quantos segundos tentar de novo |
| `X-Forwarded-For`, `X-Forwarded-Proto` | ida (proxies) | IP real do usuário e protocolo original (HTTPS), lidos só de proxies confiáveis (`TRUST_PROXY`, `DEC-068`) |

### 5.5 HTTP não guarda estado, e a sessão completa isso

O HTTP é **sem estado**: cada requisição é independente, e o servidor não "lembra" da anterior. Para saber quem está fazendo cada pedido, o EcoByte usa **sessão no servidor** (`DEC-021`):

1. No **login** (`POST /auth/login`), o servidor confere a senha, cria uma sessão **guardada no MongoDB** e responde com `Set-Cookie: ecobyte.sid=…`. O cookie leva apenas um identificador assinado, nunca dados do usuário.
2. Nas requisições seguintes, o navegador envia `Cookie: ecobyte.sid=…` **automaticamente**. A API localiza a sessão e recarrega o usuário do banco a cada pedido. Assim, uma conta desativada perde o acesso na hora.
3. A sessão é **renovada a cada resposta**, por isso o `Set-Cookie` aparece em todas as respostas do apêndice. Ela expira após 7 dias sem uso, ou 30 minutos no caso do administrador.
4. No **logout**, a sessão é apagada no servidor e o cookie, removido. O mesmo cookie, reaproveitado, passa a receber `401` (apêndice §12).

**Por que sessão e não token JWT:** como a sessão fica no servidor, ela pode ser **revogada na hora**, no logout, na desativação da conta ou na troca de senha, que encerra as demais sessões. Um token assinado continuaria válido até expirar.

### 5.6 Envelope padronizado de resposta

Toda resposta tem o mesmo formato (`DEC-017`), o que simplifica o cliente da API:

```json
{ "status": "success", "message": "Coleta aceita.", "data": { "collection": { … } } }
```

```json
{
  "status": "error",
  "message": "Existem campos inválidos.",
  "error": { "code": "VALIDATION_ERROR", "fields": { "enderecoColeta.numero": "Informe o número." } },
  "data": null
}
```

- `message` é texto pronto para mostrar ao usuário;
- `error.code` é estável e serve para o código decidir o que fazer;
- `error.fields` liga cada erro ao campo do formulário.

### 5.7 HTTPS e transporte

Em produção, todo o tráfego é HTTPS. O site envia `Strict-Transport-Security`, que obriga o navegador a usar HTTPS, e o cookie de sessão tem o atributo `Secure`, então só trafega cifrado. Atrás dos proxies da Vercel e do Render, a API reconhece a conexão original como HTTPS pelo cabeçalho `X-Forwarded-Proto`, lido só de proxies confiáveis.

---

## 6. Request/response e o funcionamento do EcoByte

### 6.1 Cada ação na tela é uma requisição

| Ação do usuário | Requisição | Resposta | O que a tela faz com ela |
|---|---|---|---|
| Entrar | `POST /auth/login` | `200` + `Set-Cookie` | Leva ao painel do perfil |
| Abrir qualquer página logada | `GET /auth/me` | `200` (usuário) ou `401` | Com `401`, vai ao login guardando a página pedida (`?proximo=`) |
| Digitar o CEP | `GET /cep/:cep` | `200` (endereço) | Preenche rua e bairro |
| Confirmar a solicitação | `POST /collections` | `201` ou `400` (campos) | Abre o detalhe da coleta criada ou marca os campos com erro |
| Coletor vê coletas disponíveis | `GET /collections/available` | `200` (lista paginada) | Mostra os cartões |
| Coletor aceita | `POST /collections/:id/accept` | `200` ou `409` | Atualiza o status ou avisa que outro coletor já aceitou |
| Cliente acompanha | `GET /collections/:id` | `200` | Mostra a etapa atual na linha do tempo |
| Sino de notificações | `GET /notifications?lida=false&limit=1` **a cada 60 s** | `200` | Atualiza o contador de não lidas |
| Admin abre Relatórios | `GET /admin/reports?inicio=…&fim=…` | `200` | Desenha os indicadores calculados no MongoDB |
| Sair | `POST /auth/logout` | `200` + cookie removido | Volta ao login |

### 6.2 O ciclo de vida de uma coleta, em requisições

```text
CLIENTE   POST /collections                  → 201  status PENDENTE
COLETOR   GET  /collections/available        → 200  a coleta aparece na lista
COLETOR   POST /collections/:id/accept       → 200  ACEITA     (cliente é notificado)
COLETOR   POST /collections/:id/start        → 200  A_CAMINHO  (cliente é notificado)
COLETOR   POST /collections/:id/collect      → 200  RECOLHIDA
COLETOR   POST /collections/:id/deliver      → 200  ENTREGUE_ECOPONTO
COLETOR   POST /collections/:id/complete     → 200  CONCLUIDA
CLIENTE   GET  /collections/:id              → 200  linha do tempo com todas as datas
```

**Cada etapa é uma requisição curta e independente.** O "estado" da coleta não fica na conexão nem na tela: fica no **documento do MongoDB**, e cada resposta devolve o estado atualizado. Uma ação fora de ordem é recusada com `422` (apêndice §9). Uma coleta de outro coletor responde `404`, sem revelar que existe.

### 6.3 Concorrência: dois coletores aceitando ao mesmo tempo

Este é o caso em que o HTTP e o banco precisam trabalhar juntos. Se dois coletores tocarem em "Aceitar" no mesmo instante, as duas requisições chegam praticamente juntas. Uma implementação ingênua faria "ler a coleta → ver que está livre → gravar o coletor", e os dois passariam pela leitura antes de qualquer gravação.

O EcoByte faz o aceite numa **única operação atômica** do MongoDB, que só altera a coleta **se ela ainda estiver pendente e sem coletor**:

```ts
// services/collection.service.ts (resumo)
Collection.findOneAndUpdate(
  { _id: id, status: "PENDENTE", coletorId: null },             // condição
  { $set: { status: "ACEITA", coletorId, acceptedAt: agora } },  // alteração
);
```

O banco garante que só uma das duas operações encontra a condição verdadeira. A outra não altera nada, e a API responde **`409 Conflict`** com "A coleta já foi aceita por outro coletor.".

**Teste real** (apêndice §8): dois aceites disparados simultaneamente contra a mesma coleta. **Resultado: um respondeu `200` e o outro `409`.** O código HTTP comunica com precisão o que aconteceu, e a tela do coletor perdedor mostra a mensagem em vez de um erro genérico.

### 6.4 Os erros fazem parte do funcionamento

Os códigos de erro são parte do fluxo normal, e a interface reage a cada um:
- **`400` com `fields`:** cada mensagem aparece embaixo do campo certo, e o foco vai para o primeiro erro.
- **`401`:** leva ao login e, depois de entrar, de volta à página que o usuário queria.
- **`403 PASSWORD_CHANGE_REQUIRED`:** um coletor recém-cadastrado é levado a trocar a senha provisória antes de qualquer outra ação.
- **`409` e `422`:** mensagens específicas da regra ("já aceita por outro coletor", "transição inválida") em vez de "algo deu errado".
- **`429`:** "Muitas tentativas. Aguarde alguns minutos.", e o cabeçalho `Retry-After` informa quanto tempo esperar.

---

## 7. Como isso foi verificado

- **Testes automatizados:** 376 testes no back-end fazem requisições HTTP reais (Supertest) contra a aplicação Express com um MongoDB em memória. Eles conferem status, cabeçalhos (cookies, `Cache-Control`, CSP) e corpo, inclusive a disputa entre coletores e os limites de tentativas.
- **Integração contínua:** a cada pull request, o GitHub Actions roda os testes, o lint, a verificação de tipos e o build. O deploy da API no Render só acontece com tudo aprovado.
- **Trocas reais:** o [apêndice](web3/trocas-http.md) traz 13 cenários capturados da API rodando, com as requisições e respostas como saíram do servidor.

## 8. Documentos relacionados no repositório

| Documento | Conteúdo |
|---|---|
| [`docs/01_ARCHITECTURE.md`](../01_ARCHITECTURE.md) | Arquitetura e responsabilidades das camadas |
| [`docs/05_ROUTES.md`](../05_ROUTES.md) · [`docs/06_API.md`](../06_API.md) | Todas as rotas e o contrato de cada uma |
| [`docs/09_AUTHENTICATION_SECURITY.md`](../09_AUTHENTICATION_SECURITY.md) | Sessão, cookies, autorização e cabeçalhos |
| [`docs/14_STATE_MACHINE.md`](../14_STATE_MACHINE.md) | Máquina de estados da coleta |
| [`docs/DECISIONS.md`](../DECISIONS.md) | Decisões citadas: DEC-015, 016, 017, 021, 063, 064, 067, 068, 069 e 091 |
