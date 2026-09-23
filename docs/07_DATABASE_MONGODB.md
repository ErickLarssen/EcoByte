# 07 — DATABASE MONGODB

## 1. Objetivo

Este documento define as diretrizes de modelagem, armazenamento, relacionamentos, índices e operações do MongoDB utilizado pelo EcoByte.

O banco de dados deve atender:

- Requisitos funcionais
- Regras de negócio
- Fluxo de coleta
- Autenticação
- Painéis por perfil
- Consultas administrativas
- Relatórios
- Consultas geoespaciais
- Histórico operacional

O documento deve permanecer alinhado com:

```text
docs/01_ARCHITECTURE.md
docs/02_DOMAIN_MODEL.md
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
docs/06_API.md
docs/08_MONGODB_QUERIES.md
```

---

# 2. Banco de dados

O banco de dados oficial do projeto é:

```text
MongoDB
```

O MongoDB será utilizado como banco de dados documental.

O sistema deve explorar características compatíveis com o modelo documental, incluindo:

- documentos BSON;
- coleções;
- documentos embutidos;
- arrays de objetos;
- referências entre documentos;
- agregações;
- índices;
- consultas geoespaciais.

---

# 3. Biblioteca de acesso

O backend poderá utilizar:

```text
Mongoose
```

para facilitar:

- definição dos schemas;
- validações;
- models;
- relacionamento por referência;
- índices;
- middlewares;
- acesso ao MongoDB.

Importante:

```text
Mongoose Schema
    ≠
MongoDB Schema rígido
```

O MongoDB continua sendo um banco documental com flexibilidade de estrutura.

O Mongoose será utilizado como camada de modelagem e validação da aplicação.

---

# 4. Fluxo de acesso ao banco

O frontend nunca deve acessar o MongoDB diretamente.

Fluxo obrigatório:

```text
Frontend
    ↓
HTTP
    ↓
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

Nenhuma credencial do MongoDB deve ser enviada ao frontend.

---

# 5. Nome do banco

O nome definitivo do banco pode ser configurado por variável de ambiente.

Exemplo:

```env
MONGODB_URI=mongodb://localhost:27017/ecobyte
```

ou, em ambiente de produção:

```env
MONGODB_URI=<MONGODB_CONNECTION_STRING>
```

Nunca versionar credenciais reais.

---

# 6. Coleções principais

A modelagem inicial deve possuir as seguintes coleções:

```text
users
collections
ecopoints
notifications
```

---

# 7. Coleção `users`

## 7.1 Objetivo

Armazenar os usuários do sistema.

---

## 7.2 Documento conceitual

```json
{
  "_id": "ObjectId",
  "nome": "Nome do usuário",
  "email": "usuario@email.com",
  "senha_hash": "HASH_DA_SENHA",
  "telefone": "11999999999",
  "documento": "DOCUMENTO",
  "role": "CLIENTE",
  "tipo_cadastro": "PF",
  "dados_empresa": null,
  "status": "ATIVO",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 7.3 Campos

| Campo | Tipo conceitual | Obrigatório | Observação |
|---|---|---:|---|
| `_id` | ObjectId | Sim | Identificador do usuário |
| `nome` | String | Sim | Nome do usuário |
| `email` | String | Sim | E-mail único |
| `senha_hash` | String | Sim | Hash da senha |
| `telefone` | String | Conforme cadastro | Telefone |
| `documento` | String | Conforme cadastro | CPF/CNPJ conforme tipo |
| `role` | Enum | Sim | `CLIENTE`, `COLETOR`, `ADMIN` |
| `tipo_cadastro` | Enum | Para cliente | `PF`, `PJ` |
| `dados_empresa` | Object/null | Para PJ | Dados específicos da empresa |
| `status` | Enum | Sim | `ATIVO`, `INATIVO` |
| `createdAt` | Date | Sim | Data de criação |
| `updatedAt` | Date | Sim | Última atualização |

---

# 8. Role

O campo:

```text
role
```

deve aceitar somente:

```text
CLIENTE
COLETOR
ADMIN
```

Não utilizar `tipo_cadastro` para controlar permissões.

---

# 9. Tipo de cadastro

O campo:

```text
tipo_cadastro
```

deve aceitar:

```text
PF
PJ
```

Esse campo é independente de:

```text
role
```

Exemplo válido:

```json
{
  "role": "CLIENTE",
  "tipo_cadastro": "PF"
}
```

Outro exemplo:

```json
{
  "role": "CLIENTE",
  "tipo_cadastro": "PJ"
}
```

---

# 10. Dados de empresa

Para clientes PJ, o documento pode conter:

```json
{
  "dados_empresa": {
    "razaoSocial": "Empresa Exemplo Ltda.",
    "nomeFantasia": "Empresa Exemplo"
  }
}
```

Os campos definitivos devem seguir os requisitos aprovados do projeto.

Para clientes PF:

```text
dados_empresa = null
```

ou campo ausente, conforme a convenção adotada.

A aplicação deve manter uma única convenção.

---

# 11. Status do usuário

O campo:

```text
status
```

deve aceitar:

```text
ATIVO
INATIVO
```

Usuários inativos não devem conseguir utilizar funcionalidades protegidas.

---

# 12. Índices da coleção `users`

## 12.1 Índice único de e-mail

O e-mail deve possuir índice único.

Conceitualmente:

```text
email: 1
unique: true
```

O sistema deve evitar duplicidade de contas.

---

## 12.2 Índices adicionais

Índices adicionais somente devem ser criados quando houver necessidade real de consulta.

Exemplos possíveis:

```text
role
status
tipo_cadastro
```

Não criar índices indiscriminadamente.

---

# 13. Senhas

O campo:

```text
senha_hash
```

deve armazenar somente o hash da senha.

Nunca armazenar:

```text
senha
senha_original
senha_em_texto_puro
```

---

# 14. Coleção `collections`

## 14.1 Objetivo

Armazenar as solicitações de coleta de lixo eletrônico.

---

## 14.2 Documento conceitual

```json
{
  "_id": "ObjectId",
  "usuarioId": "ObjectId",
  "coletorId": null,
  "enderecoColeta": {
    "logradouro": "Rua Exemplo",
    "numero": "100",
    "complemento": "",
    "bairro": "Centro",
    "cidade": "Diadema",
    "estado": "SP",
    "cep": "09900000",
    "localizacao": {
      "type": "Point",
      "coordinates": [
        -46.62,
        -23.68
      ]
    }
  },
  "itensDescarte": [
    {
      "categoria": "NOTEBOOK",
      "quantidade": 1,
      "condicao": "FUNCIONANDO"
    }
  ],
  "dataAgendada": "Date",
  "status": "PENDENTE",
  "observacoes": "Observação da coleta.",
  "createdAt": "Date",
  "updatedAt": "Date",
  "acceptedAt": null,
  "startedAt": null,
  "collectedAt": null,
  "deliveredAt": null,
  "completedAt": null
}
```

---

# 15. Campos de `collections`

| Campo | Tipo conceitual | Obrigatório | Observação |
|---|---|---:|---|
| `_id` | ObjectId | Sim | Identificador da coleta |
| `usuarioId` | ObjectId | Sim | Referência ao cliente |
| `coletorId` | ObjectId/null | Não inicialmente | Referência ao coletor |
| `enderecoColeta` | Object | Sim | Endereço histórico |
| `itensDescarte` | Array | Sim | Itens da coleta |
| `dataAgendada` | Date | Conforme fluxo | Data da coleta |
| `status` | Enum | Sim | Estado atual |
| `observacoes` | String | Não | Observações |
| `createdAt` | Date | Sim | Criação |
| `updatedAt` | Date | Sim | Atualização |
| `acceptedAt` | Date/null | Não inicialmente | Aceite |
| `startedAt` | Date/null | Não inicialmente | Início |
| `collectedAt` | Date/null | Não inicialmente | Recolhimento |
| `deliveredAt` | Date/null | Não inicialmente | Entrega |
| `completedAt` | Date/null | Não inicialmente | Conclusão |

---

# 16. Referência `usuarioId`

O campo:

```text
usuarioId
```

deve referenciar:

```text
users._id
```

Representação conceitual:

```text
collections.usuarioId
        ↓
users._id
```

---

# 17. Referência `coletorId`

O campo:

```text
coletorId
```

deve referenciar:

```text
users._id
```

Quando a coleta estiver:

```text
PENDENTE
```

o campo deve permanecer:

```text
null
```

ou utilizar a convenção de ausência definida pelo projeto.

Uma única convenção deve ser adotada.

Quando a coleta for aceita:

```text
coletorId = ID_DO_COLETOR
```

---

# 18. Endereço embutido

O endereço da coleta deve ser embutido dentro do próprio documento da coleta.

Exemplo:

```json
{
  "enderecoColeta": {
    "logradouro": "Rua Exemplo",
    "numero": "100",
    "complemento": "",
    "bairro": "Centro",
    "cidade": "Diadema",
    "estado": "SP",
    "cep": "09900000"
  }
}
```

---

# 19. Motivo para embutir o endereço

O endereço da coleta representa o endereço utilizado no momento da solicitação.

Ele deve permanecer preservado mesmo que o usuário altere posteriormente seu endereço cadastral.

Fluxo:

```text
Usuário
    ↓
Solicita coleta
    ↓
Endereço é copiado para a coleta
    ↓
Coleta preserva o endereço histórico
```

---

# 20. Localização da coleta

Quando disponível, o endereço pode conter:

```text
localizacao
```

utilizando GeoJSON:

```json
{
  "type": "Point",
  "coordinates": [
    -46.62,
    -23.68
  ]
}
```

A ordem obrigatória é:

```text
[longitude, latitude]
```

---

# 21. Índice geoespacial

O campo de localização deve utilizar um índice:

```text
2dsphere
```

quando consultas geoespaciais forem utilizadas.

Exemplo conceitual:

```text
enderecoColeta.localizacao
```

com índice:

```text
2dsphere
```

---

# 22. Itens de descarte

Os itens devem ser armazenados como array embutido dentro da coleta.

Exemplo:

```json
{
  "itensDescarte": [
    {
      "categoria": "NOTEBOOK",
      "quantidade": 2,
      "condicao": "FUNCIONANDO"
    },
    {
      "categoria": "CELULAR",
      "quantidade": 3,
      "condicao": "DANIFICADO"
    }
  ]
}
```

---

# 23. Estrutura do item

Cada item deve possuir, no mínimo:

```text
categoria
quantidade
condicao
```

Exemplo:

```json
{
  "categoria": "NOTEBOOK",
  "quantidade": 1,
  "condicao": "FUNCIONANDO"
}
```

As categorias e condições definitivas devem seguir os requisitos aprovados.

Não inventar categorias permanentes sem decisão do projeto.

---

# 24. Status da coleta

O campo:

```text
status
```

deve aceitar exclusivamente:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

---

# 25. Integridade do status

O banco não deve ser considerado a única camada responsável por validar as transições.

A validação principal da máquina de estados deve ocorrer no service/backend.

Fluxo obrigatório:

```text
Request
    ↓
Authorization
    ↓
Service
    ↓
Validação da transição
    ↓
Database update
```

---

# 26. Timestamps da coleta

A coleta deve registrar timestamps específicos para cada etapa relevante.

```text
createdAt
acceptedAt
startedAt
collectedAt
deliveredAt
completedAt
updatedAt
```

Exemplo:

```json
{
  "acceptedAt": "2026-10-10T14:00:00.000Z",
  "startedAt": "2026-10-10T14:15:00.000Z",
  "collectedAt": "2026-10-10T14:40:00.000Z",
  "deliveredAt": "2026-10-10T15:20:00.000Z",
  "completedAt": "2026-10-10T15:25:00.000Z"
}
```

Os valores acima são apenas exemplos de estrutura.

---

# 27. Coleta pendente

Ao criar uma coleta:

```text
status = PENDENTE
```

e:

```text
coletorId = null
acceptedAt = null
startedAt = null
collectedAt = null
deliveredAt = null
completedAt = null
```

---

# 28. Coleta aceita

Ao aceitar:

```text
status = ACEITA
```

e:

```text
coletorId = ID_DO_COLETOR
acceptedAt = data/hora atual
```

Os timestamps das etapas posteriores ainda não devem ser preenchidos.

---

# 29. Coleta em andamento

Ao iniciar:

```text
status = A_CAMINHO
startedAt = data/hora atual
```

---

# 30. Coleta recolhida

Ao confirmar o recolhimento:

```text
status = RECOLHIDA
collectedAt = data/hora atual
```

---

# 31. Coleta entregue

Ao confirmar a entrega:

```text
status = ENTREGUE_ECOPONTO
deliveredAt = data/hora atual
```

---

# 32. Coleta concluída

Ao concluir:

```text
status = CONCLUIDA
completedAt = data/hora atual
```

---

# 33. Coleção `ecopoints`

## 33.1 Objetivo

Representar o ecoponto físico central da EcoByte.

No MVP existe apenas um ecoponto principal.

---

## 33.2 Documento conceitual

```json
{
  "_id": "ObjectId",
  "nome": "EcoByte",
  "descricao": "Ecoponto central da EcoByte.",
  "endereco": {
    "logradouro": "Rua Exemplo",
    "numero": "100",
    "complemento": "",
    "bairro": "Centro",
    "cidade": "Diadema",
    "estado": "SP",
    "cep": "09900000"
  },
  "localizacao": {
    "type": "Point",
    "coordinates": [
      -46.62,
      -23.68
    ]
  },
  "horarios": [],
  "status": "ATIVO",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

# 34. Campos de `ecopoints`

| Campo | Tipo conceitual | Obrigatório | Observação |
|---|---|---:|---|
| `_id` | ObjectId | Sim | Identificador |
| `nome` | String | Sim | Nome do ecoponto |
| `descricao` | String | Não | Descrição |
| `endereco` | Object | Sim | Endereço |
| `localizacao` | GeoJSON Point | Conforme disponibilidade | Coordenadas |
| `horarios` | Array | Conforme definição | Horários de funcionamento |
| `status` | Enum | Sim | `ATIVO`, `INATIVO` |
| `createdAt` | Date | Sim | Criação |
| `updatedAt` | Date | Sim | Atualização |

---

# 35. Localização do ecoponto

Quando disponível:

```json
{
  "type": "Point",
  "coordinates": [
    -46.62,
    -23.68
  ]
}
```

A ordem continua sendo:

```text
[longitude, latitude]
```

---

# 36. Índice geoespacial do ecoponto

Caso consultas geográficas sejam realizadas:

```text
localizacao: 2dsphere
```

deve ser utilizado.

---

# 37. Coleção `notifications`

## 37.1 Objetivo

Armazenar notificações destinadas aos usuários.

---

## 37.2 Documento conceitual

```json
{
  "_id": "ObjectId",
  "usuarioId": "ObjectId",
  "tipo": "COLETA_ATUALIZADA",
  "titulo": "Atualização da coleta",
  "mensagem": "Sua coleta foi aceita.",
  "referencia": {
    "tipo": "COLETA",
    "id": "COLLECTION_ID"
  },
  "lida": false,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Os campos exatos podem ser refinados conforme a implementação de notificações.

---

# 38. Referência da notificação

O campo:

```text
usuarioId
```

deve referenciar:

```text
users._id
```

A notificação deve pertencer a um único usuário destinatário.

---

# 39. Referência opcional à coleta

Quando a notificação estiver relacionada a uma coleta, pode existir:

```text
referencia
```

com informações como:

```text
tipo
id
```

Exemplo:

```json
{
  "referencia": {
    "tipo": "COLETA",
    "id": "COLLECTION_ID"
  }
}
```

---

# 40. Status de leitura

A notificação deve possuir:

```text
lida
```

com valor:

```text
true
false
```

---

# 41. Relações entre coleções

## Usuário → Coletas

```text
users._id
    ↓
collections.usuarioId
```

Um usuário pode possuir várias coletas.

---

## Coletor → Coletas

```text
users._id
    ↓
collections.coletorId
```

Um coletor pode ser responsável por várias coletas.

---

## Usuário → Notificações

```text
users._id
    ↓
notifications.usuarioId
```

Um usuário pode possuir várias notificações.

---

## Coleta → Notificação

Uma notificação pode opcionalmente referenciar uma coleta por meio de seu identificador.

---

# 42. Referências vs documentos embutidos

A modelagem deve utilizar documentos embutidos quando os dados:

- pertencem claramente à entidade principal;
- precisam ser recuperados junto dela;
- possuem ciclo de vida dependente;
- fazem sentido como parte do documento principal.

Utilizar referências quando os dados:

- possuem identidade própria;
- são compartilhados;
- possuem ciclo de vida independente;
- são consultados separadamente.

---

# 43. Dados embutidos no documento `collections`

Devem permanecer embutidos:

```text
enderecoColeta
itensDescarte
```

porque pertencem diretamente àquela solicitação de coleta.

---

# 44. Dados referenciados

Devem permanecer como referências:

```text
usuarioId
coletorId
usuarioId de notifications
```

porque representam entidades independentes.

---

# 45. Histórico de endereço

Não utilizar uma referência para o endereço atual do usuário como substituto do endereço histórico da coleta.

Incorreto:

```text
collection
    ↓
user
    ↓
currentAddress
```

Preferido:

```text
collection
    ├── usuarioId
    └── enderecoColeta
```

Dessa forma, a coleta mantém o endereço utilizado no momento da solicitação.

---

# 46. Integridade referencial

MongoDB não deve ser tratado como um banco relacional tradicional.

Quando referências entre documentos forem utilizadas, a aplicação deve garantir:

- existência do documento referenciado;
- permissões de acesso;
- consistência das operações;
- tratamento adequado quando o documento referenciado estiver inativo.

---

# 47. Exclusão de usuários

Usuários com histórico operacional relevante não devem ser simplesmente removidos do banco.

Preferir:

```text
status = INATIVO
```

Isso preserva os relacionamentos históricos.

---

# 48. Exclusão de coletas

Coletas com histórico operacional não devem ser removidas fisicamente sem requisito explícito.

O histórico das coletas deve permanecer preservado.

---

# 49. Índices recomendados

Os índices devem ser criados conforme os padrões reais de consulta.

Índices iniciais esperados:

## `users`

```text
email: unique
```

Possíveis índices adicionais:

```text
role
status
tipo_cadastro
```

---

## `collections`

Possíveis índices:

```text
usuarioId
coletorId
status
createdAt
dataAgendada
```

---

## `collections` — geolocalização

```text
enderecoColeta.localizacao: 2dsphere
```

quando consultas geoespaciais forem utilizadas.

---

## `ecopoints`

```text
localizacao: 2dsphere
```

quando consultas geoespaciais forem utilizadas.

---

## `notifications`

Possíveis índices:

```text
usuarioId
lida
createdAt
```

---

# 50. Índices e performance

Não criar índices apenas porque um campo existe.

Cada índice possui custo de armazenamento e manutenção.

Antes de adicionar um novo índice:

```text
identificar consulta
    ↓
analisar frequência
    ↓
avaliar seletividade
    ↓
criar índice
    ↓
medir resultado
```

---

# 51. Consultas administrativas

Consultas administrativas podem utilizar:

```text
find
findOne
countDocuments
sort
limit
skip
aggregate
```

quando apropriado.

Consultas mais complexas devem ser documentadas em:

```text
docs/08_MONGODB_QUERIES.md
```

---

# 52. Aggregation Pipeline

O MongoDB deve ser utilizado para demonstrar consultas de agregação quando forem relevantes ao projeto.

Exemplos de operações conceitualmente possíveis:

```text
$match
$group
$sort
$project
$unwind
$lookup
$count
$dateToString
```

A seleção dos operadores deve ser baseada nas consultas reais do sistema.

---

# 53. Consultas geoespaciais

Quando necessário, o banco poderá utilizar operadores geoespaciais do MongoDB sobre campos:

```text
2dsphere
```

Exemplos de finalidade:

```text
buscar recursos próximos
calcular proximidade
filtrar por raio geográfico
```

As consultas definitivas devem ser documentadas em:

```text
docs/08_MONGODB_QUERIES.md
```

---

# 54. Validação com Mongoose

Caso Mongoose seja utilizado, os schemas devem validar pelo menos:

- campos obrigatórios;
- enums;
- formatos básicos;
- tipos;
- referências;
- estruturas embutidas.

Exemplo conceitual:

```text
status
    enum:
        PENDENTE
        ACEITA
        A_CAMINHO
        RECOLHIDA
        ENTREGUE_ECOPONTO
        CONCLUIDA
```

A validação do Mongoose não substitui as regras de negócio do service.

---

# 55. Regras de negócio vs schema

O schema pode impedir:

```text
status inexistente
campo obrigatório ausente
tipo incompatível
```

Mas o schema sozinho não deve ser responsável por toda a máquina de estados.

Exemplo:

```text
PENDENTE → CONCLUIDA
```

é uma regra de negócio.

Essa validação pertence principalmente ao backend/service.

---

# 56. Transações

Transações do MongoDB somente devem ser utilizadas quando houver necessidade real de atomicidade envolvendo múltiplas operações.

Não utilizar transações indiscriminadamente.

Operações simples que puderem ser resolvidas por uma atualização atômica devem preferir esse mecanismo.

---

# 57. Concorrência na aceitação de coleta

A aceitação de uma coleta deve ser protegida contra concorrência.

Conceitualmente:

```text
procurar coleta
    ↓
id = X
status = PENDENTE
    ↓
alterar para ACEITA
    ↓
atribuir coletor
```

A atualização deve garantir que somente uma operação consiga alterar a coleta de:

```text
PENDENTE
```

para:

```text
ACEITA
```

---

# 58. Estado inicial das coleções

## Usuário

```text
status = ATIVO
```

quando o cadastro for concluído conforme o fluxo definido.

---

## Coleta

```text
status = PENDENTE
coletorId = null
```

---

## Ecoponto

```text
status = ATIVO
```

somente conforme os dados de configuração definidos.

---

## Notificação

```text
lida = false
```

quando criada.

---

# 59. Seed de desenvolvimento

O ambiente de desenvolvimento deve possuir dados fictícios suficientes para testar os principais fluxos.

Sugestão:

```text
1 ADMIN
1 CLIENTE PF
1 CLIENTE PJ
1 COLETOR
1 ECOPONTO
```

Também devem existir coletas fictícias representando os principais estados:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

---

# 60. Dados fictícios

Seeds nunca devem utilizar dados reais sensíveis.

Utilizar:

```text
e-mails fictícios
documentos fictícios
telefones fictícios
endereços fictícios
credenciais exclusivamente de desenvolvimento
```

---

# 61. Variáveis de ambiente

As informações de conexão devem ficar fora do código.

Exemplo:

```env
MONGODB_URI=mongodb://localhost:27017/ecobyte
```

Produção deve utilizar uma variável de ambiente equivalente.

Nunca versionar:

```text
senha do banco
connection string com credenciais reais
tokens
chaves privadas
```

---

# 62. Estrutura conceitual

A estrutura geral do banco:

```text
MongoDB
│
├── users
│   ├── CLIENTE
│   ├── COLETOR
│   └── ADMIN
│
├── collections
│   ├── referência → users
│   ├── endereço embutido
│   └── itens embutidos
│
├── ecopoints
│   └── ecoponto central EcoByte
│
└── notifications
    ├── referência → users
    └── referência opcional → collections
```

---

# 63. Diagrama conceitual

```text
┌──────────────────────┐
│        USERS         │
├──────────────────────┤
│ _id                  │
│ nome                 │
│ email                │
│ senha_hash           │
│ role                 │
│ tipo_cadastro        │
│ dados_empresa        │
│ status               │
└──────────┬───────────┘
           │
           │ usuarioId
           ▼
┌──────────────────────────────┐
│        COLLECTIONS           │
├──────────────────────────────┤
│ _id                          │
│ usuarioId                    │
│ coletorId                    │
│ enderecoColeta               │
│ itensDescarte[]              │
│ dataAgendada                 │
│ status                       │
│ observacoes                  │
│ createdAt                    │
│ updatedAt                    │
│ acceptedAt                   │
│ startedAt                    │
│ collectedAt                  │
│ deliveredAt                  │
│ completedAt                  │
└──────────────┬───────────────┘
               │
               │ coletorId
               └──────────────► USERS


┌──────────────────────┐
│      ECOP OINTS      │
├──────────────────────┤
│ _id                  │
│ nome                 │
│ descricao            │
│ endereco             │
│ localizacao          │
│ horarios             │
│ status               │
└──────────────────────┘


┌──────────────────────┐
│    NOTIFICATIONS     │
├──────────────────────┤
│ _id                  │
│ usuarioId            │──────────► USERS
│ tipo                 │
│ titulo               │
│ mensagem              │
│ referencia           │──────────► COLLECTIONS
│ lida                 │
│ createdAt            │
│ updatedAt            │
└──────────────────────┘
```

---

# 64. Convenção de nomes

Os nomes utilizados na aplicação devem permanecer consistentes.

Convenção definida para documentos:

```text
users
collections
ecopoints
notifications
```

Campos de domínio:

```text
usuarioId
coletorId
enderecoColeta
itensDescarte
dataAgendada
senha_hash
tipo_cadastro
```

Caso o projeto adote outra convenção posteriormente, a alteração deve ser registrada e aplicada de maneira consistente em toda a aplicação.

---

# 65. Dados históricos

O banco deve preservar dados suficientes para reconstruir o histórico operacional.

Para uma coleta, deve ser possível identificar:

```text
quem solicitou
qual endereço foi utilizado
quais itens foram informados
qual coletor assumiu
quando foi aceita
quando iniciou
quando foi recolhida
quando foi entregue
quando foi concluída
```

---

# 66. MongoDB como banco documental

O modelo não deve tentar reproduzir desnecessariamente uma estrutura relacional tradicional.

Exemplo adequado ao MongoDB:

```text
collection
├── enderecoColeta
└── itensDescarte[]
```

Exemplo de referência:

```text
collection
└── usuarioId → users
```

A modelagem deve escolher entre embedding e referência conforme a natureza do dado.

---

# 67. Regra contra duplicação desnecessária

Não duplicar dados de entidades independentes sem necessidade.

Exemplo:

Não copiar integralmente os dados atuais do usuário para cada coleta.

Preferir:

```text
usuarioId
```

e armazenar somente os dados históricos que precisam ser preservados, como:

```text
enderecoColeta
```

---

# 68. Regra contra dependência excessiva de referências

Também não criar referências para dados que pertencem naturalmente à entidade principal.

Exemplo:

```text
enderecoColeta
```

deve permanecer embutido na coleta.

---

# 69. Consistência dos documentos

Mesmo com a flexibilidade do MongoDB, a aplicação deve manter uma estrutura previsível.

Não permitir que documentos da mesma coleção assumam formatos arbitrariamente diferentes sem motivo documentado.

---

# 70. Evolução do schema

Quando uma estrutura precisar evoluir:

```text
identificar alteração
    ↓
avaliar impacto
    ↓
atualizar documentação
    ↓
atualizar schema/model
    ↓
atualizar serviços
    ↓
atualizar testes
```

Não alterar o formato dos documentos de maneira silenciosa.

---

# 71. Migrações

Caso uma alteração estrutural exija transformação dos documentos existentes, criar um processo de migração adequado.

Não presumir que alterar somente o schema do Mongoose transformará automaticamente todos os documentos existentes.

---

# 72. Backup

O ambiente de produção deve possuir estratégia de backup compatível com a infraestrutura escolhida.

As credenciais e configurações de backup não devem ser armazenadas no código.

---

# 73. Observabilidade

Operações críticas de banco devem poder ser diagnosticadas por logs apropriados, sem registrar dados sensíveis.

Evitar registrar:

```text
senha
senha_hash
tokens
credenciais
```

---

# 74. Requisitos acadêmicos

A implementação do banco deve demonstrar o uso real de conceitos de MongoDB, incluindo:

- documentos;
- coleções;
- estrutura flexível;
- documentos embutidos;
- referências;
- consultas;
- filtros;
- atualizações;
- agregações;
- índices;
- consultas geoespaciais, quando utilizadas.

O banco não deve ser utilizado apenas como armazenamento superficial.

---

# 75. Consultas complexas

Consultas mais elaboradas devem ser documentadas em:

```text
docs/08_MONGODB_QUERIES.md
```

Exemplos de consultas que podem ser relevantes:

```text
coletas por status
coletas por período
coletas por cliente
coletas por coletor
quantidade de coletas por status
quantidade de resíduos por categoria
relatórios administrativos
consultas geográficas
```

---

# 76. Critérios de integridade

O banco e o backend devem trabalhar juntos para garantir:

```text
e-mail único
referências válidas
status válido
timestamps coerentes
estrutura previsível
dados históricos preservados
operações concorrentes controladas
```

---

# 77. Fonte de verdade

A estrutura de dados deve permanecer alinhada principalmente com:

```text
docs/02_DOMAIN_MODEL.md
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
docs/06_API.md
docs/08_MONGODB_QUERIES.md
docs/14_STATE_MACHINE.md
```

Quando uma alteração de domínio modificar a estrutura dos documentos, atualizar esta documentação antes da implementação.

---

# 78. Regra final

O MongoDB deve armazenar os dados de forma coerente com o domínio real do EcoByte.

A prioridade da modelagem deve ser:

```text
Domínio real
    ↓
Regras de negócio
    ↓
Modelo de dados
    ↓
API
    ↓
Frontend
```

Não adaptar o domínio às limitações de uma implementação improvisada.

Quando existir dúvida estrutural, consultar primeiro:

```text
02_DOMAIN_MODEL.md
03_BUSINESS_RULES.md
01_ARCHITECTURE.md
```

e registrar decisões relevantes em:

```text
docs/DECISIONS.md
```