# DECISIONS — Registro de Decisões Arquiteturais e de Produto

## 1. Objetivo

Este documento registra as decisões relevantes tomadas durante o desenvolvimento da plataforma EcoByte.

Seu objetivo é evitar que decisões já estabelecidas sejam redefinidas ou contraditas durante a implementação.

Cada decisão deve registrar:

- contexto;
- decisão adotada;
- motivo;
- impacto;
- documentos relacionados;
- status.

Este arquivo deve ser atualizado sempre que uma decisão estrutural, arquitetural, de negócio, segurança, UX ou tecnologia for alterada.

---

# 2. Status das Decisões

Os status utilizados são:

```text
ACEITA
PENDENTE
SUBSTITUIDA
REJEITADA
```

### ACEITA

Decisão atual do projeto e que deve ser seguida pela implementação.

### PENDENTE

Questão ainda não definida.

### SUBSTITUIDA

Decisão que foi válida anteriormente, mas foi substituída por outra.

### REJEITADA

Alternativa analisada e descartada.

---

# 3. DEC-001 — Plataforma EcoByte como Agente de Coleta

**Status:** ACEITA

## Contexto

O sistema precisa representar claramente o funcionamento operacional do negócio.

## Decisão

A EcoByte será responsável pela operação de coleta dos resíduos eletrônicos.

A plataforma digital não funcionará apenas como um marketplace ou intermediário entre cliente e empresas externas.

Fluxo principal:

```text
Cliente
   ↓
Plataforma EcoByte
   ↓
Solicitação de coleta
   ↓
Coletor EcoByte
   ↓
Endereço do cliente
   ↓
Recolhimento
   ↓
Ecoponto central EcoByte
```

## Impacto

O domínio passa a precisar representar:

- clientes;
- coletores;
- coletas;
- rotas/operações do coletor;
- ecoponto central;
- estados operacionais da coleta.

## Documentos relacionados

```text
02_DOMAIN_MODEL.md
03_BUSINESS_RULES.md
13_COLLECTOR_FLOW.md
14_STATE_MACHINE.md
```

---

# 4. DEC-002 — Existência de um Único Ecoponto no MVP

**Status:** ACEITA

## Contexto

Foi necessário definir se o sistema trabalharia com uma rede de ecopontos ou com uma unidade central.

## Decisão

O MVP possuirá somente um ecoponto físico pertencente à EcoByte.

Esse ecoponto é o destino de todas as coletas concluídas.

Modelo:

```text
EcoByte
   │
   └── Ecoponto Central
```

Não haverá, no MVP, uma rede de ecopontos de terceiros.

## Impacto

A entidade `Ecopoint` continua existindo para representar formalmente o local físico, mas o domínio atual pressupõe apenas uma unidade ativa principal.

## Evolução futura

Uma arquitetura multi-eccoponto poderá ser implementada futuramente caso o escopo seja expandido.

Essa evolução não deve alterar desnecessariamente o MVP atual.

---

# 5. DEC-003 — Separação entre `role` e `tipoCadastro`

**Status:** ACEITA

## Contexto

O sistema precisa diferenciar o tipo de usuário no sistema de acordo com suas permissões e também distinguir clientes Pessoa Física e Pessoa Jurídica.

## Decisão

Serão utilizados dois conceitos diferentes:

```text
role
```

e:

```text
tipoCadastro
```

### `role`

Define a função operacional do usuário:

```text
CLIENTE
COLETOR
ADMIN
```

### `tipoCadastro`

Define o tipo cadastral do usuário:

```text
PF
PJ
```

Exemplos:

```text
CLIENTE + PF
CLIENTE + PJ
COLETOR + PF
ADMIN + PF
```

## Motivo

Esses conceitos representam informações diferentes e não devem ser combinados em um único campo.

---

# 6. DEC-004 — Máquina de Estados da Coleta

**Status:** ACEITA

## Contexto

O fluxo de coleta precisa ser previsível e impedir alterações arbitrárias de status.

## Decisão

A coleta utilizará exatamente os seguintes estados:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

Fluxo oficial:

```text
PENDENTE
    ↓
ACEITA
    ↓
A_CAMINHO
    ↓
RECOLHIDA
    ↓
ENTREGUE_ECOPONTO
    ↓
CONCLUIDA
```

## Transições permitidas

```text
PENDENTE → ACEITA

ACEITA → A_CAMINHO

A_CAMINHO → RECOLHIDA

RECOLHIDA → ENTREGUE_ECOPONTO

ENTREGUE_ECOPONTO → CONCLUIDA
```

Não são permitidas transições arbitrárias.

Exemplo:

```text
PENDENTE → CONCLUIDA
```

é inválido.

## Documentos relacionados

```text
03_BUSINESS_RULES.md
13_COLLECTOR_FLOW.md
14_STATE_MACHINE.md
```

---

# 7. DEC-005 — Atribuição do Coletor na Aceitação

**Status:** ACEITA

## Contexto

Foi necessário definir em qual momento uma coleta deixa de estar disponível para outros coletores.

## Decisão

O campo:

```text
coletorId
```

será preenchido no momento em que a coleta passa de:

```text
PENDENTE
```

para:

```text
ACEITA
```

Antes disso:

```text
coletorId = null/ausente
```

Depois:

```text
coletorId = ID do coletor responsável
```

## Impacto

A aceitação da coleta representa também sua atribuição operacional.

---

# 8. DEC-006 — Controle de Concorrência na Aceitação

**Status:** ACEITA

## Contexto

Dois coletores podem tentar aceitar a mesma coleta simultaneamente.

## Decisão

A operação de aceitação deve ser atômica.

Somente um coletor poderá assumir uma coleta que esteja:

```text
PENDENTE
```

Caso outro coletor tente aceitar a mesma coleta depois que ela já foi atribuída:

```text
HTTP 409 Conflict
```

## Objetivo

Impedir que uma mesma coleta seja atribuída a múltiplos coletores.

## Documentos relacionados

```text
06_API.md
08_MONGODB_QUERIES.md
14_STATE_MACHINE.md
17_TESTING.md
```

---

# 9. DEC-007 — Timestamps do Ciclo de Vida

**Status:** ACEITA

## Decisão

A entidade `Collection` deverá registrar o histórico temporal de sua evolução.

Campos:

```text
createdAt
updatedAt
acceptedAt
startedAt
collectedAt
deliveredAt
completedAt
```

A existência de cada timestamp deve ser coerente com o estado atual.

Exemplo:

```text
PENDENTE
→ acceptedAt = null

ACEITA
→ acceptedAt preenchido

A_CAMINHO
→ acceptedAt + startedAt preenchidos

RECOLHIDA
→ acceptedAt + startedAt + collectedAt preenchidos

ENTREGUE_ECOPONTO
→ acceptedAt + startedAt + collectedAt + deliveredAt preenchidos

CONCLUIDA
→ todos os timestamps do fluxo preenchidos
```

---

# 10. DEC-008 — Endereço da Coleta como Snapshot Histórico

**Status:** ACEITA

## Contexto

O cliente pode alterar seu endereço cadastrado após criar uma coleta.

## Decisão

O endereço utilizado para a coleta será armazenado dentro do próprio documento de `Collection`.

Exemplo:

```text
Collection
├── usuarioId
├── enderecoColeta
└── itensDescarte
```

Nomes de campos conforme `DEC-061`.

O endereço da coleta representa um snapshot dos dados no momento da solicitação.

## Consequência

Alterações posteriores no endereço cadastral do usuário não devem alterar automaticamente o endereço histórico de uma coleta já criada.

## Motivo

Preservação da integridade histórica e operacional.

---

# 11. DEC-009 — Resíduos como Dados Embutidos na Coleta

**Status:** ACEITA

## Contexto

Uma solicitação de coleta pode conter vários tipos e quantidades de resíduos.

## Decisão

Os itens de resíduos serão armazenados dentro da própria coleta.

Estrutura conceitual:

```json
{
  "itensDescarte": [
    {
      "categoria": "...",
      "quantidade": 0,
      "condicao": "..."
    }
  ]
}
```

Nomes de campos conforme `DEC-061`.

## Motivo

Os itens representam diretamente a composição de uma coleta específica e não exigem, no MVP, uma coleção independente para cada item.

---

# 12. DEC-010 — MongoDB como Banco de Dados Principal

**Status:** ACEITA

## Contexto

O projeto acadêmico possui requisito de utilização de banco de dados não relacional.

## Decisão

O banco de dados principal do projeto será:

```text
MongoDB
```

O sistema deverá demonstrar explicitamente conceitos de banco documental, incluindo:

- documentos;
- coleções;
- referências;
- documentos embutidos;
- consultas;
- agregações;
- índices;
- consultas geoespaciais.

## Documentos relacionados

```text
07_DATABASE_MONGODB.md
08_MONGODB_QUERIES.md
```

---

# 13. DEC-011 — Estrutura Documental Híbrida

**Status:** ACEITA

## Contexto

MongoDB permite escolher entre embedding e referências dependendo do relacionamento.

## Decisão

O projeto utilizará uma abordagem híbrida.

### Embedding

Será utilizado quando os dados:

- pertencerem diretamente ao documento;
- fizerem sentido dentro daquele contexto;
- precisarem ser preservados como histórico.

Exemplos:

```text
Collection.enderecoColeta
Collection.itensDescarte
```

### Referências

Serão utilizadas para entidades independentes e compartilhadas.

Exemplos:

```text
Collection.usuarioId
Collection.coletorId
Collection.ecopontoId
```

Nomes de campos conforme `DEC-061`.

---

# 14. DEC-012 — GeoJSON para Localização

**Status:** ACEITA

## Decisão

Localizações geográficas serão representadas usando GeoJSON `Point`.

Estrutura:

```json
{
  "type": "Point",
  "coordinates": [
    -46.0000,
    -23.0000
  ]
}
```

A ordem das coordenadas será:

```text
[longitude, latitude]
```

A coleção que possuir dados geográficos deverá utilizar índice:

```text
2dsphere
```

## Objetivo

Permitir consultas geoespaciais do MongoDB.

---

# 15. DEC-013 — Arquitetura em Camadas no Backend

**Status:** ACEITA

## Decisão

O backend utilizará uma organização lógica em camadas:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Model / Data Access
  ↓
MongoDB
```

## Responsabilidades

### Route

Define endpoints e encaminha requisições.

### Controller

Interpreta a requisição HTTP e produz a resposta.

### Service

Centraliza regras de negócio e casos de uso.

### Model / Data Access

Responsável pelo acesso aos dados.

### MongoDB

Persistência.

## Motivo

Separar transporte HTTP, lógica de negócio e persistência.

---

# 16. DEC-014 — Frontend não Acessa MongoDB Diretamente

**Status:** ACEITA

## Decisão

O fluxo de comunicação será:

```text
Frontend
    ↓
HTTP
    ↓
Backend
    ↓
MongoDB
```

Nunca:

```text
Frontend
    ↓
MongoDB
```

## Motivo

O backend precisa controlar:

- autenticação;
- autorização;
- regras de negócio;
- validação;
- transições de estado;
- persistência;
- segurança.

---

# 17. DEC-015 — Backend como Autoridade das Regras de Negócio

**Status:** ACEITA

## Decisão

O frontend não será considerado autoridade para decisões de negócio.

Exemplos de regras que obrigatoriamente serão verificadas no backend:

```text
usuário autenticado
role permitida
propriedade do recurso
transição de status
atribuição do coletor
existência do ecoponto
regras de criação de coleta
```

O frontend pode realizar validações antecipadas para melhorar a experiência, mas isso não substitui a validação do backend.

---

# 18. DEC-016 — API Versionada

**Status:** ACEITA

## Decisão

A API utilizará o prefixo:

```text
/api/v1
```

Exemplo:

```text
GET /api/v1/collections
```

## Motivo

Permitir evolução futura da API sem quebrar imediatamente os consumidores existentes.

---

# 19. DEC-017 — Envelope Padronizado de Resposta

**Status:** ACEITA

## Resposta de sucesso

Formato:

```json
{
  "status": "success",
  "message": "Operação realizada com sucesso.",
  "data": {}
}
```

## Resposta de erro

Formato:

```json
{
  "status": "error",
  "message": "Não foi possível realizar a operação.",
  "error": {
    "code": "ERROR_CODE",
    "fields": {}
  },
  "data": null
}
```

## Motivo

Padronizar o consumo da API pelo frontend.

---

# 20. DEC-018 — Autenticação Separada de Autorização

**Status:** ACEITA

## Decisão

O sistema tratará separadamente:

### Autenticação

Determina:

```text
quem é o usuário
```

### Autorização

Determina:

```text
o que o usuário pode fazer
```

A autorização será baseada principalmente em:

```text
role
```

com validações adicionais de propriedade e regras de negócio.

---

# 21. DEC-019 — Requisitos Mínimos de Senha

**Status:** ACEITA

## Decisão

A senha deverá possuir:

```text
mínimo de 8 caracteres
pelo menos uma letra maiúscula
pelo menos uma letra minúscula
pelo menos um número
pelo menos um caractere especial
```

Essas regras devem existir no frontend para feedback ao usuário e no backend como validação definitiva.

---

# 22. DEC-020 — Senhas Nunca Armazenadas em Texto Puro

**Status:** ACEITA

## Decisão

A aplicação armazenará somente hashes de senha.

A senha original não deverá ser persistida.

Algoritmo preferencial:

```text
Argon2id
```

Alternativa aceitável:

```text
bcrypt
```

A escolha definitiva do algoritmo deve permanecer consistente em toda a aplicação.

---

# 23. DEC-021 — Mecanismo de Sessão/Token

**Status:** ACEITA

**Data:** 2026-09-24

**Histórico:** permaneceu PENDENTE até 2026-09-24. Resolve `OQ-002`.

## Contexto

O projeto precisa definir o mecanismo concreto utilizado para manter a autenticação.

A diretriz original priorizava mecanismos seguros, preferencialmente utilizando cookie HTTP-only, para evitar exposição desnecessária de credenciais no JavaScript do navegador.

Opções avaliadas:

```text
Sessão tradicional no servidor
ou
Token de autenticação (JWT) em cookie HTTP-only
```

## Decisão

A autenticação utilizará **sessão no servidor**:

```text
express-session
+
store de sessões no MongoDB (connect-mongo)
+
cookie HttpOnly contendo somente o identificador da sessão
```

Configuração do cookie:

```text
HttpOnly = true
SameSite = Lax
Secure   = true em produção
```

O segredo de assinatura do cookie será fornecido por:

```text
SESSION_SECRET
```

O tempo de expiração será configurado por variável de ambiente:

```text
SESSION_MAX_AGE
```

O valor definitivo da expiração permanece em aberto em `OQ-062`.

## Motivo

- o logout invalida a sessão no servidor, e não apenas no navegador;
- a desativação de um usuário (`INATIVO`) pode ser verificada a cada requisição sem depender da expiração de um token;
- nenhuma credencial fica acessível ao JavaScript do frontend;
- o store no MongoDB reaproveita o banco oficial do projeto.

## Impacto

- nova coleção `sessions`, gerenciada pelo store de sessão;
- o middleware de autenticação lê a sessão e carrega o usuário no backend;
- a topologia frontend/backend segue `DEC-063`, permitindo `SameSite=Lax`;
- `JWT_SECRET` não faz parte da configuração do projeto.

## Continuam em aberto

```text
OQ-060  sessões simultâneas
OQ-062  tempo de expiração
política complementar de CSRF além de SameSite
```

## Documentos relacionados

```text
07_DATABASE_MONGODB.md
09_AUTHENTICATION_SECURITY.md
18_DEVELOPMENT.md
19_DEPLOYMENT.md
```

---

# 24. DEC-022 — Recuperação de Senha Não Enviará Senha Atual

**Status:** ACEITA

## Decisão

O sistema nunca deverá enviar a senha atual do usuário por e-mail ou outro canal.

O fluxo correto deve utilizar token temporário de recuperação.

Conceito:

```text
Solicitar recuperação
        ↓
Gerar token temporário
        ↓
Enviar link
        ↓
Usuário define nova senha
        ↓
Token invalidado
```

A implementação do provedor de e-mail continua dependente da infraestrutura escolhida.

---

# 25. DEC-023 — Email de Verificação

**Status:** PENDENTE

## Contexto

Ainda é necessário decidir se o cadastro exigirá confirmação do endereço de e-mail antes de permitir acesso completo.

## Questão em aberto

Definir:

```text
verificação obrigatória
```

ou:

```text
verificação opcional
```

## Documento relacionado

```text
OPEN_QUESTIONS.md
```

---

# 26. DEC-024 — Desativação Lógica em vez de Exclusão Física

**Status:** ACEITA

## Contexto

Alguns recursos possuem histórico e não devem desaparecer fisicamente quando deixam de estar ativos.

## Decisão

Quando aplicável, será utilizada desativação lógica.

Exemplo:

```text
ATIVO
INATIVO
```

em vez de simplesmente apagar o documento.

## Motivo

Preservar histórico, auditoria e referências existentes.

---

# 27. DEC-025 — Notificações como Entidade Própria

**Status:** ACEITA

## Decisão

Notificações serão persistidas separadamente dos documentos de usuário.

Exemplo conceitual:

```text
notifications
├── userId
├── type
├── title
├── message
├── read
└── createdAt
```

## Motivo

Permitir:

- histórico;
- leitura/não leitura;
- ordenação;
- filtros;
- consultas;
- futuras extensões.

---

# 28. DEC-026 — Design System Centralizado

**Status:** ACEITA

## Decisão

A interface deverá utilizar um design system centralizado.

Elementos como:

```text
cores
tipografia
espaçamento
botões
inputs
cards
badges
modais
feedbacks
```

não devem ser redefinidos arbitrariamente em cada página.

## Documentos relacionados

```text
10_DESIGN_SYSTEM.md
11_COMPONENTS.md
```

---

# 29. DEC-027 — Stack Visual com Tailwind, Shadcn e Lucide

**Status:** ACEITA

## Decisão

A camada visual será construída considerando:

```text
Tailwind CSS
shadcn/ui
Lucide React
```

como base para componentes e identidade visual.

Essas ferramentas devem ser usadas de forma consistente com o design system.

---

# 30. DEC-028 — Framer Motion como Solução Principal de Motion

**Status:** ACEITA

## Decisão

A solução preferencial para animações de interface será:

```text
Framer Motion
```

GSAP poderá ser utilizado quando existir necessidade de animações mais complexas ou de controle temporal avançado.

Para interações simples, CSS poderá ser suficiente.

## Hierarquia preferencial

```text
CSS
  ↓
Framer Motion
  ↓
GSAP
```

Não utilizar animações complexas onde uma solução CSS simples seja suficiente.

---

# 31. DEC-029 — Mobile-First

**Status:** ACEITA

## Decisão

A interface será desenvolvida com abordagem:

```text
mobile-first
```

A responsividade deve ser parte do desenvolvimento do componente, e não uma etapa posterior.

Prioridade:

```text
mobile
↓
tablet
↓
desktop
```

---

# 32. DEC-030 — Acessibilidade como Requisito

**Status:** ACEITA

## Decisão

A acessibilidade será tratada como requisito funcional e não apenas como refinamento visual.

Devem ser considerados:

```text
navegação por teclado
foco visível
HTML semântico
labels
contraste
mensagens de erro
áreas de toque
redução de movimento
leitores de tela
```

---

# 33. DEC-031 — Resíduos Eletrônicos como Domínio Central

**Status:** ACEITA

## Decisão

O sistema será especializado no gerenciamento de solicitações de coleta de resíduos eletrônicos.

O domínio não será transformado em uma plataforma genérica de transporte ou logística.

A estrutura das funcionalidades deve continuar relacionada ao processo:

```text
solicitação
→ coleta
→ transporte
→ entrega
→ destinação
```

---

# 34. DEC-032 — Coletor como Papel Operacional Específico

**Status:** ACEITA

## Decisão

O coletor não será tratado simplesmente como um cliente com permissões extras.

Ele possui fluxo operacional próprio.

O painel do coletor deve contemplar:

```text
rotas do dia
coletas disponíveis
aceitar coleta
iniciar rota
confirmar recolhimento
entregar no ecoponto
concluir coleta
```

---

# 35. DEC-033 — Admin como Papel Separado

**Status:** ACEITA

## Decisão

O administrador possuirá `role` própria:

```text
ADMIN
```

Não deverá herdar automaticamente comportamento de:

```text
CLIENTE
```

ou:

```text
COLETOR
```

A autorização administrativa deverá ser explícita.

---

# 36. DEC-034 — Seed Fictício e Reproduzível

**Status:** ACEITA

## Decisão

O projeto possuirá dados de seed para desenvolvimento, testes e demonstração.

O seed deverá:

```text
ser fictício
ser reproduzível
ser validável
não conter dados reais
não rodar em produção por padrão
```

Também deverá permitir representar todos os estados principais da máquina de coletas.

## Documento relacionado

```text
20_SEED_DATA.md
```

---

# 37. DEC-035 — Dados de Seed Não São Dados de Produção

**Status:** ACEITA

## Decisão

Dados criados automaticamente para desenvolvimento não devem ser usados como dados reais da plataforma.

Especialmente:

```text
credenciais
e-mails
telefones
endereços
coordenadas
nomes
```

devem permanecer fictícios nos ambientes de desenvolvimento.

---

# 38. DEC-036 — Segurança de Segredos via Variáveis de Ambiente

**Status:** ACEITA

## Decisão

Segredos e configurações sensíveis não devem ser armazenados no código-fonte.

Exemplos:

```text
MONGODB_URI
chaves de APIs
segredos de autenticação
credenciais de serviços
configurações privadas
```

Devem utilizar variáveis de ambiente.

O repositório deve possuir:

```text
.env.example
```

sem valores secretos.

---

# 39. DEC-037 — `.env` Fora do Git

**Status:** ACEITA

## Decisão

Arquivos contendo segredos locais devem permanecer fora do controle de versão.

Exemplo:

```gitignore
.env
.env.local
.env.*.local
```

O arquivo:

```text
.env.example
```

pode permanecer no repositório desde que não contenha segredos reais.

---

# 40. DEC-038 — API como Fronteira de Segurança

**Status:** ACEITA

## Decisão

O backend será responsável por impedir operações não autorizadas.

O frontend não poderá ser considerado mecanismo de segurança.

Exemplo:

Ocultar um botão:

```text
Não é autorização.
```

Verificar a permissão no backend:

```text
É autorização.
```

---

# 41. DEC-039 — Histórico Operacional Deve ser Preservado

**Status:** ACEITA

## Decisão

Informações necessárias para reconstruir o histórico da coleta devem permanecer disponíveis após sua conclusão.

Isso inclui, quando aplicável:

```text
cliente
coletor
endereço da coleta
itens coletados
timestamps
ecoponto
status
```

O encerramento da coleta não deve apagar seu histórico operacional.

---

# 42. DEC-040 — Validação no Frontend + Backend

**Status:** ACEITA

## Decisão

Validações relevantes serão realizadas em duas camadas.

### Frontend

Objetivo:

```text
feedback imediato
UX
redução de erros de preenchimento
```

### Backend

Objetivo:

```text
segurança
integridade
regra de negócio
```

Nunca assumir que um dado é válido apenas porque passou pela validação do frontend.

---

# 43. DEC-041 — Estado da Coleta Determinado pelo Backend

**Status:** ACEITA

## Decisão

O frontend não poderá alterar arbitrariamente o status da coleta.

Em vez de:

```text
PATCH /collections/:id
{
  "status": "CONCLUIDA"
}
```

sem validação de domínio, a API deverá utilizar operações compatíveis com o fluxo.

Exemplos:

```text
POST /collections/:id/accept
POST /collections/:id/start
POST /collections/:id/collect
POST /collections/:id/deliver
POST /collections/:id/complete
```

Cada operação deve validar o estado anterior.

---

# 44. DEC-042 — Organização da Documentação

**Status:** ACEITA

## Decisão

As decisões importantes não deverão ficar somente em mensagens de chat, código ou memória informal.

A documentação oficial do projeto será organizada em arquivos Markdown.

Estrutura principal:

```text
docs/
├── 00_PROJECT_OVERVIEW.md
├── 01_ARCHITECTURE.md
├── 02_DOMAIN_MODEL.md
├── 03_BUSINESS_RULES.md
├── 04_REQUIREMENTS.md
├── 05_ROUTES.md
├── 06_API.md
├── 07_DATABASE_MONGODB.md
├── 08_MONGODB_QUERIES.md
├── 09_AUTHENTICATION_SECURITY.md
├── 10_DESIGN_SYSTEM.md
├── 11_COMPONENTS.md
├── 12_RESPONSIVENESS_ACCESSIBILITY.md
├── 13_COLLECTOR_FLOW.md
├── 14_STATE_MACHINE.md
├── 15_INTERACTIONS_MOTION.md
├── 16_ASSETS.md
├── 17_TESTING.md
├── 18_DEVELOPMENT.md
├── 19_DEPLOYMENT.md
├── 20_SEED_DATA.md
├── DECISIONS.md
└── OPEN_QUESTIONS.md
```

---

# 45. DEC-043 — Decisões Importantes Devem ser Registradas

**Status:** ACEITA

## Decisão

Mudanças relevantes devem ser adicionadas a este documento.

Exemplos:

```text
troca de banco
mudança da arquitetura
mudança de autenticação
mudança da máquina de estados
mudança de regras críticas
mudança de stack
mudança estrutural do domínio
mudança significativa de UX
```

Pequenas alterações de implementação não precisam gerar uma nova decisão.

---

# 46. DEC-044 — Uma Decisão Não Deve Ser Alterada Silenciosamente

**Status:** ACEITA

## Decisão

Quando uma decisão anterior deixar de representar o projeto atual, ela não deve simplesmente ser apagada.

O registro deve permanecer com:

```text
Status: SUBSTITUIDA
```

e indicar a nova decisão.

Exemplo:

```text
DEC-010
Status: SUBSTITUIDA

Substituída por:
DEC-025
```

## Motivo

Preservar a evolução arquitetural do projeto e permitir entender por que determinada escolha foi feita.

---

# 47. DEC-045 — Questões Não Definidas Não Devem ser Inventadas

**Status:** ACEITA

## Decisão

Quando uma decisão ainda não estiver estabelecida, ela deve ser registrada como:

```text
PENDENTE
```

em vez de assumir uma implementação arbitrária.

Questões ainda abertas devem ser direcionadas para:

```text
OPEN_QUESTIONS.md
```

## Motivo

Evitar que uma decisão temporária seja confundida com requisito definitivo.

---

# 48. DEC-046 — Configurações Acadêmicas Não Devem Descaracterizar o Domínio

**Status:** ACEITA

## Contexto

O projeto precisa atender requisitos acadêmicos relacionados a Node.js, arquitetura web e MongoDB.

## Decisão

Os requisitos acadêmicos devem ser incorporados à solução sem transformar artificialmente o domínio.

Exemplo:

O uso de MongoDB deve ser demonstrado por necessidades reais do sistema, como:

```text
documentos
dados embutidos
agregações
consultas geoespaciais
relatórios
```

e não por estruturas criadas apenas para "mostrar MongoDB".

---

# 49. DEC-047 — Funcionalidade Deve Ser Baseada no Domínio Documentado

**Status:** ACEITA

## Decisão

Antes de criar uma nova funcionalidade, a implementação deve consultar a documentação do projeto.

A ordem de referência recomendada é:

```text
requisitos
↓
modelo de domínio
↓
regras de negócio
↓
arquitetura
↓
API
↓
implementação
```

Quando houver conflito entre código e documentação oficial, a divergência deve ser identificada e decidida explicitamente.

---

# 50. DEC-048 — Documentação como Fonte de Contexto para IA

**Status:** ACEITA

## Contexto

O projeto será desenvolvido com auxílio de ferramentas de IA de programação.

## Decisão

Os arquivos Markdown do projeto funcionarão como contexto persistente para agentes de IA.

As IAs devem consultar os documentos relevantes antes de:

```text
criar arquitetura
alterar domínio
criar componentes
criar rotas
alterar estados
implementar autenticação
alterar banco
```

O objetivo é reduzir inconsistência entre diferentes sessões e diferentes ferramentas.

---

# 51. DEC-049 — CLAUDE.md como Ponto de Entrada Operacional

**Status:** ACEITA

## Decisão

O arquivo:

```text
CLAUDE.md
```

será utilizado como ponto de entrada para orientação geral do Claude Code.

Ele deve:

```text
apresentar o projeto
definir diretrizes
apontar documentação
estabelecer regras essenciais
orientar a consulta dos arquivos
```

Detalhes extensos devem permanecer nos documentos especializados.

## Motivo

Evitar um `CLAUDE.md` excessivamente grande e difícil de manter.

---

# 52. DEC-050 — Skills e Documentos Especializados Complementam o CLAUDE.md

**Status:** ACEITA

## Decisão

O projeto poderá utilizar instruções especializadas e Skills para tarefas específicas.

Exemplos:

```text
revisão de código
criação de componentes
testes
auditoria de acessibilidade
validação de API
revisão de arquitetura
```

O `CLAUDE.md` não deve concentrar todas as instruções detalhadas.

---

# 53. DEC-051 — Regra de Não Duplicação de Responsabilidades

**Status:** ACEITA

## Decisão

Cada camada deve possuir responsabilidade clara.

Exemplo:

```text
Route
→ roteamento

Controller
→ HTTP

Service
→ negócio

Model/Data Access
→ persistência

Frontend
→ apresentação/interação
```

Evitar colocar regras de negócio complexas diretamente em:

```text
componentes React
rotas
middlewares genéricos
arquivos de configuração
```

quando a responsabilidade pertence ao Service ou domínio.

---

# 54. DEC-052 — Padrão de Resposta para Erros de Concorrência

**Status:** ACEITA

## Decisão

Quando duas operações conflitarem por causa do estado atual do recurso, a API utilizará:

```text
409 Conflict
```

Exemplo:

```text
Coleta já aceita por outro coletor.
```

A resposta deverá utilizar o envelope de erro padronizado.

---

# 55. DEC-053 — Integridade Histórica do Ecoponto

**Status:** ACEITA

## Contexto

A coleta precisa indicar onde o material foi entregue.

## Decisão

Quando uma coleta chegar ao ecoponto, a relação com o ecoponto deverá ser registrada.

Exemplo:

```text
ecopontoId
```

deve ser preenchido em estados que representem entrega ou conclusão.

Isso permite consultar posteriormente onde a coleta foi processada.

## Momento do preenchimento

**Data:** 2026-09-24

O campo `ecopontoId` é preenchido na transição:

```text
RECOLHIDA → ENTREGUE_ECOPONTO
```

com o identificador do ecoponto central com `status = ATIVO`.

Por estado:

```text
PENDENTE, ACEITA, A_CAMINHO, RECOLHIDA
→ ecopontoId = null

ENTREGUE_ECOPONTO, CONCLUIDA
→ ecopontoId preenchido
```

Se não existir ecoponto ativo, a entrega deve falhar em vez de registrar uma coleta sem destino.

---

# 56. DEC-054 — Escopo do MVP Deve Permanecer Controlado

**Status:** ACEITA

## Decisão

Funcionalidades não essenciais ao fluxo principal devem ser tratadas como evolução futura até que sejam formalmente incorporadas ao escopo.

Fluxo principal do MVP:

```text
cadastro/login
      ↓
solicitação de coleta
      ↓
coleta atribuída
      ↓
coletor realiza atendimento
      ↓
entrega no ecoponto
      ↓
conclusão
```

Novas funcionalidades devem ser avaliadas contra esse fluxo antes de serem incorporadas.

---

# 57. DEC-055 — Questões Futuras Devem Ir para `OPEN_QUESTIONS.md`

**Status:** ACEITA

## Decisão

Questões ainda não resolvidas devem ser registradas separadamente para não contaminar as decisões já consolidadas.

Exemplos atuais:

```text
verificação de e-mail
endereço definitivo do ecoponto
coordenadas definitivas
horários de coleta
categorias definitivas
limite de quantidade
obtenção da geolocalização
notificações em tempo real
provedor de recuperação de senha
relatórios administrativos
integrações externas
```

---

# 58. DEC-056 — Mudanças de Escopo Devem Atualizar a Documentação

**Status:** ACEITA

## Decisão

Quando uma funcionalidade for adicionada ou removida do escopo, os documentos afetados devem ser atualizados.

Uma mudança de escopo pode afetar:

```text
requirements
domain model
business rules
routes
API
database
components
testing
seed
deployment
```

Não alterar apenas o código e deixar a documentação desatualizada.

---

# 59. DEC-057 — Consistência entre Documentação e Implementação

**Status:** ACEITA

## Decisão

A implementação final deve refletir as decisões vigentes.

Exemplo:

Se a documentação define:

```text
PENDENTE → ACEITA
```

o sistema não deve possuir uma implementação que aceite:

```text
PENDENTE → CONCLUIDA
```

sem que exista uma nova decisão formal alterando o comportamento.

---

# 60. DEC-058 — Registro de Data e Motivo para Mudanças Importantes

**Status:** ACEITA

## Decisão

Novas decisões importantes devem, sempre que possível, registrar:

```text
Data
Contexto
Motivo
Decisão
Impacto
```

Modelo:

```md
## DEC-XXX — Título

**Status:** ACEITA

**Data:** AAAA-MM-DD

## Contexto

...

## Decisão

...

## Motivo

...

## Impacto

...
```

---

# 61. DEC-059 — Histórico de Decisões é Parte da Arquitetura

**Status:** ACEITA

## Decisão

Este arquivo deve ser considerado parte da documentação arquitetural do sistema.

Não é apenas um changelog.

Seu objetivo é responder:

```text
Por que essa decisão existe?
```

e não somente:

```text
O que mudou?
```

---

# 62. DEC-060 — Regra de Precedência Documental

**Status:** ACEITA

## Decisão

Quando diferentes documentos apresentarem informações incompatíveis, a inconsistência deverá ser identificada e resolvida explicitamente.

Como regra geral:

```text
DECISÕES
+
REGRAS DE NEGÓCIO
+
MODELO DE DOMÍNIO
```

devem ser considerados na resolução de mudanças estruturais.

Entretanto, nenhuma inconsistência deve ser "corrigida silenciosamente".

A equipe deve:

```text
identificar
→ discutir
→ decidir
→ atualizar documentos
→ implementar
→ testar
```

---

# 63. DEC-061 — Convenção de Nomes de Campos

**Status:** ACEITA

**Data:** 2026-09-24

## Contexto

Os documentos utilizavam três convenções diferentes para os mesmos campos:

```text
português camelCase   → usuarioId, enderecoColeta, itensDescarte
português snake_case  → senha_hash, tipo_cadastro, dados_empresa
inglês camelCase      → clientId, address, wasteItems, passwordHash, zipCode
```

Isso impedia a definição consistente de models, API e seed.

## Decisão

Os campos de domínio utilizarão **português em camelCase**, idênticos no MongoDB, na API e no seed.

### Usuário (`users`)

```text
nome
email
senhaHash
telefone
documento
role
tipoCadastro
dadosEmpresa
status
```

### Coleta (`collections`)

```text
usuarioId
coletorId
ecopontoId
enderecoColeta
itensDescarte
dataAgendada
status
observacoes
```

### Ecoponto (`ecopoints`)

```text
nome
descricao
endereco
localizacao
horarios
status
```

### Notificação (`notifications`)

```text
usuarioId
tipo
titulo
mensagem
referencia
lida
```

### Endereço (embutido)

```text
logradouro
numero
complemento
bairro
cidade
estado
cep
localizacao
```

### Item de descarte (embutido)

```text
categoria
quantidade
condicao
```

### Exceções

Timestamps permanecem em inglês, seguindo a convenção do Mongoose:

```text
createdAt
updatedAt
acceptedAt
startedAt
collectedAt
deliveredAt
completedAt
```

Valores de enum permanecem em maiúsculas:

```text
CLIENTE, COLETOR, ADMIN
PF, PJ
ATIVO, INATIVO
PENDENTE, ACEITA, A_CAMINHO, RECOLHIDA, ENTREGUE_ECOPONTO, CONCLUIDA
```

Nomes das coleções MongoDB permanecem em inglês:

```text
users
collections
ecopoints
notifications
sessions
```

Na API, `_id` é exposto como `id` (06_API §40).

Nomes de código (models, services, componentes) podem utilizar inglês, por exemplo `User`, `Collection`, `Ecopoint`, `CollectionStatusBadge`.

## Motivo

- a maior parte da documentação de domínio já utilizava português camelCase;
- o body da API já utilizava `tipoCadastro`;
- elimina mapeamentos entre nomes diferentes para o mesmo dado.

## Impacto

Atualizados:

```text
02_DOMAIN_MODEL.md
03_BUSINESS_RULES.md
07_DATABASE_MONGODB.md
08_MONGODB_QUERIES.md
09_AUTHENTICATION_SECURITY.md
20_SEED_DATA.md
```

---

# 64. DEC-062 — Stack Tecnológico e Ferramentas

**Status:** ACEITA

**Data:** 2026-09-24

## Contexto

O stack estava descrito somente no `CLAUDE.md`. Documentos de assets, desenvolvimento e deploy presumiam Vite e SPA, divergindo do stack adotado.

## Decisão

### Organização

```text
Monorepo com npm workspaces

Ecobyte/
├── package.json      (workspaces: frontend, backend)
├── frontend/
├── backend/
└── docs/
```

### Runtime e gerenciador

```text
Node.js 22 LTS
npm
```

### Frontend

```text
Next.js (App Router)
React
TypeScript
Tailwind CSS
shadcn/ui
Framer Motion
Lucide React
```

### Backend

```text
Node.js
Express
TypeScript
Mongoose
Zod (validação de entrada)
express-session + connect-mongo (DEC-021)
tsx (execução de TypeScript em desenvolvimento e scripts)
```

### Testes

```text
Vitest                 → unitários (frontend e backend)
Supertest              → API
mongodb-memory-server  → integração com MongoDB
Testing Library        → componentes
Playwright             → E2E
axe                    → acessibilidade
```

## Regras

- O frontend Next.js não implementa regras de negócio em Route Handlers, Server Actions ou equivalentes (`DEC-015`).
- Vite não faz parte do stack.
- Não alternar gerenciador de pacotes sem nova decisão.

## Documentos relacionados

```text
01_ARCHITECTURE.md
11_COMPONENTS.md
16_ASSETS.md
17_TESTING.md
18_DEVELOPMENT.md
19_DEPLOYMENT.md
```

---

# 65. DEC-063 — Topologia Frontend → API via Proxy

**Status:** ACEITA

**Data:** 2026-09-24

## Contexto

Com sessão em cookie (`DEC-021`), frontend e backend em origens diferentes exigiriam CORS com credenciais, `SameSite=None` e proteção CSRF adicional.

## Decisão

O navegador acessa somente a origem do frontend.

O Next.js encaminha as requisições da API ao Express utilizando `rewrites`:

```text
Navegador
    ↓
https://frontend/api/v1/*
    ↓  (rewrite do Next.js)
Express /api/v1/*
    ↓
MongoDB
```

A URL interna do backend é configurada no frontend por variável somente de servidor:

```text
API_INTERNAL_URL
```

## Regras

- O rewrite é exclusivamente roteamento: não contém autenticação, autorização nem regra de negócio.
- O Express continua sendo a API oficial e valida tudo (`DEC-015`, `DEC-038`).
- O cookie de sessão é first-party, permitindo `SameSite=Lax`.

## Documentos relacionados

```text
01_ARCHITECTURE.md
09_AUTHENTICATION_SECURITY.md
18_DEVELOPMENT.md
19_DEPLOYMENT.md
```

---

# 66. DEC-064 — Endpoints Operacionais de Coleta

**Status:** ACEITA

**Data:** 2026-09-24

## Contexto

`RF-057` exigia `PATCH /collections/:id/status`, enquanto `DEC-041` definia endpoints por ação. Além disso, `RF-028` exigia que o coletor visse suas coletas, mas não havia endpoint para isso.

## Decisão

### Transições

As transições de status ocorrem exclusivamente pelos endpoints de ação:

```text
POST /api/v1/collections/:id/accept
POST /api/v1/collections/:id/start
POST /api/v1/collections/:id/collect
POST /api/v1/collections/:id/deliver
POST /api/v1/collections/:id/complete
```

O endpoint:

```text
PATCH /api/v1/collections/:id/status
```

não faz parte do contrato e não deve ser implementado.

### Coletas atribuídas ao coletor

```text
GET /api/v1/collections/assigned
```

- acesso: `COLETOR`;
- retorna somente coletas com `coletorId = usuário autenticado`.

`GET /api/v1/collections` continua exclusivo do `CLIENTE`.

Quais status aparecem em cada agrupamento da tela permanece em aberto em `OQ-047`.

## Motivo

Uma única forma de transicionar o estado e uma rota por caso de uso.

## Documentos relacionados

```text
04_REQUIREMENTS.md
05_ROUTES.md
06_API.md
13_COLLECTOR_FLOW.md
14_STATE_MACHINE.md
```

---

# 67. DEC-065 — Atualização do Ecoponto via PATCH

**Status:** ACEITA

**Data:** 2026-09-24

## Decisão

A atualização administrativa do ecoponto utilizará:

```text
PATCH /api/v1/ecopoint
```

em vez de `PUT`, representando alteração parcial.

Acesso: `ADMIN`.

## Motivo

Coerência com os métodos HTTP definidos em `01_ARCHITECTURE.md`.

---

# 68. Registro Atual de Decisões Pendentes

As seguintes decisões permanecem explicitamente abertas:

```text
DEC-023
Verificação de e-mail
```

Outras questões de negócio e implementação devem permanecer em:

```text
OPEN_QUESTIONS.md
```

até serem formalmente decididas.

---

# 69. Como Adicionar uma Nova Decisão

Utilizar o seguinte modelo:

```md
## DEC-XXX — Título

**Status:** ACEITA

**Data:** AAAA-MM-DD

## Contexto

Explique o problema ou necessidade.

## Decisão

Descreva claramente o que foi decidido.

## Motivo

Explique por que a decisão foi adotada.

## Impacto

Descreva consequências técnicas, funcionais
ou de negócio.

## Documentos relacionados

```text
arquivo1.md
arquivo2.md
```
```

---

# 70. Regra Final

As decisões registradas neste documento representam o estado atual conhecido do projeto.

Antes de alterar uma decisão estrutural:

```text
1. identificar a decisão existente;
2. entender seu contexto;
3. avaliar os impactos;
4. registrar a nova decisão;
5. marcar a decisão anterior como SUBSTITUIDA, quando aplicável;
6. atualizar os documentos afetados;
7. atualizar a implementação;
8. atualizar os testes.
```

A documentação deve evoluir junto com o software.

```text
Decisão
   ↓
Documentação
   ↓
Implementação
   ↓
Testes
   ↓
Validação
```

Essa sequência deve ser mantida para preservar a consistência arquitetural e funcional da plataforma EcoByte.