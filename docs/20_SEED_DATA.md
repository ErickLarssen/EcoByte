# 20 — Seed Data

## 1. Objetivo

Este documento define os dados iniciais utilizados para desenvolvimento, testes, demonstrações acadêmicas e validação das principais funcionalidades da plataforma EcoByte.

O seed deve criar um ambiente previsível e reproduzível, permitindo testar:

- autenticação;
- autorização por `role`;
- usuários PF e PJ;
- fluxo completo de coleta;
- todas as etapas da máquina de estados;
- funcionamento do coletor;
- ecoponto central;
- notificações;
- consultas MongoDB;
- agregações e relatórios;
- consultas geoespaciais;
- cenários de concorrência;
- diferentes combinações de dados para testes de interface.

Os dados de seed são exclusivamente fictícios.

O seed **não deve ser utilizado como fonte de dados reais de produção**.

---

> **Seed não é inicialização.** Para preparar um banco de produção (primeiro administrador e ecoponto), use `npm run bootstrap --workspace backend` (`DEC-087`). Ele só cria o que falta e nunca apaga dados. O seed é só para desenvolvimento e demonstração, e é bloqueado em produção.

# 2. Princípios do Seed

## 2.1 Reprodutibilidade

A execução do seed deve produzir um ambiente conhecido e previsível.

Sempre que possível:

```text
seed
  ↓
limpeza controlada das coleções de desenvolvimento
  ↓
criação dos documentos
  ↓
criação das relações
  ↓
validação
```

O processo deve ser idempotente sempre que a implementação permitir.

Executar o seed duas vezes não deve resultar em duplicação de usuários ou outros registros que deveriam ser únicos.

---

## 2.2 Dados fictícios

Todos os dados devem ser claramente fictícios.

Não utilizar:

- CPF real;
- CNPJ real;
- telefone pessoal real;
- e-mail pessoal real;
- endereço residencial real;
- coordenadas de residência de pessoas reais;
- senhas reais;
- tokens reais;
- informações pessoais obtidas de usuários.

Os dados apresentados neste documento servem exclusivamente para desenvolvimento e testes.

---

## 2.3 Ambiente

O seed deve ser executado preferencialmente em:

```text
development
test
staging
```

A execução em produção deve ser bloqueada por padrão.

Exemplo:

```js
if (process.env.NODE_ENV === 'production') {
  throw new Error(
    'Seed não pode ser executado em produção.'
  );
}
```

Caso exista uma necessidade excepcional de popular um ambiente de produção, esse processo deve ser tratado separadamente e explicitamente, sem reutilizar este seed de desenvolvimento.

---

# 3. Dados que Devem Existir

O seed mínimo deve criar:

```text
Users
├── 1 ADMIN
├── 1 CLIENTE PF
├── 1 CLIENTE PJ
└── 1 COLETOR

Ecopoints
└── 1 Ecoponto central EcoByte

Collections
├── 1 PENDENTE
├── 1 ACEITA
├── 1 A_CAMINHO
├── 1 RECOLHIDA
├── 1 ENTREGUE_ECOPONTO
└── 1 CONCLUIDA

Notifications
└── múltiplas notificações relacionadas aos usuários
```

A quantidade pode ser ampliada posteriormente para suportar testes de paginação, filtros, agregações e performance.

---

# 4. Usuários

## 4.1 Admin

Dados conceituais:

```json
{
  "nome": "Administrador EcoByte",
  "email": "admin@ecobyte.local",
  "senha": "SenhaAdmin123!",
  "role": "ADMIN",
  "tipoCadastro": "PF",
  "status": "ATIVO"
}
```

Características:

```text
role:
  ADMIN

tipoCadastro:
  PF

status:
  ATIVO
```

Esse usuário deve possuir permissão administrativa para:

- visualizar usuários;
- visualizar coletas;
- gerenciar recursos administrativos previstos;
- consultar relatórios;
- consultar informações do ecoponto.

---

## 4.2 Cliente Pessoa Física

Dados conceituais:

```json
{
  "nome": "Mariana Oliveira",
  "email": "mariana@ecobyte.local",
  "senha": "ClientePF123!",
  "role": "CLIENTE",
  "tipoCadastro": "PF",
  "status": "ATIVO"
}
```

Características:

```text
role:
  CLIENTE

tipoCadastro:
  PF

status:
  ATIVO
```

Esse usuário deve possuir dados suficientes para testar:

- login;
- atualização de perfil;
- criação de coleta;
- consulta de coletas próprias;
- acompanhamento de status;
- notificações.

---

## 4.3 Cliente Pessoa Jurídica

Dados conceituais:

```json
{
  "nome": "Tech Verde Soluções",
  "email": "empresa@ecobyte.local",
  "senha": "ClientePJ123!",
  "role": "CLIENTE",
  "tipoCadastro": "PJ",
  "status": "ATIVO"
}
```

Características:

```text
role:
  CLIENTE

tipoCadastro:
  PJ

status:
  ATIVO
```

O usuário PJ deve permitir testar diferenças de apresentação e dados cadastrais entre:

```text
PF
```

e:

```text
PJ
```

O campo `role` continua sendo:

```text
CLIENTE
```

A distinção entre PF e PJ deve permanecer exclusivamente em:

```text
tipoCadastro
```

---

## 4.4 Coletor

Dados conceituais:

```json
{
  "nome": "Carlos Mendes",
  "email": "coletor@ecobyte.local",
  "senha": "Coletor123!",
  "role": "COLETOR",
  "tipoCadastro": "PF",
  "status": "ATIVO"
}
```

Características:

```text
role:
  COLETOR

tipoCadastro:
  PF

status:
  ATIVO
```

Esse usuário será utilizado nos testes de:

- visualização de coletas disponíveis;
- aceitação de coleta;
- início da rota;
- confirmação de recolhimento;
- entrega no ecoponto;
- conclusão da coleta.

---

# 5. Formato de Senhas no Seed

As senhas exibidas neste documento são apenas senhas de demonstração.

Na base de dados, nunca devem ser armazenadas em texto puro.

Exemplo conceitual:

```json
{
  "senhaHash": "<HASH_GERADO_PELO_ALGORITMO_DE_HASH>"
}
```

O seed deve utilizar a mesma estratégia adotada pela aplicação para geração de hashes.

Caso o projeto utilize:

```text
Argon2id
```

o seed deve gerar hashes com Argon2id.

Caso o projeto utilize:

```text
bcrypt
```

o seed deve gerar hashes com bcrypt.

Não inserir manualmente senhas em plaintext na coleção `users`.

---

# 6. Identificadores

Os documentos podem utilizar `ObjectId` padrão do MongoDB.

Exemplo:

```text
ObjectId("...")
```

O código responsável pelo seed deve preferencialmente permitir que o MongoDB gere os IDs automaticamente.

Quando for necessário criar relações entre documentos durante o seed, os IDs gerados devem ser armazenados em variáveis.

Exemplo conceitual:

```js
const admin = await User.create({...});
const clientePF = await User.create({...});
const clientePJ = await User.create({...});
const coletor = await User.create({...});
```

Posteriormente:

```js
coletorId: coletor._id
```

Essa abordagem evita a dependência de IDs fixos.

---

# 7. Ecoponto

O MVP possui **um único ecoponto físico central**, pertencente à EcoByte.

O seed deve criar exatamente um ecoponto principal.

Exemplo conceitual:

```json
{
  "nome": "Ecoponto Central EcoByte",
  "descricao": "Centro de recebimento e destinação de resíduos eletrônicos da EcoByte.",
  "status": "ATIVO",
  "endereco": {
    "logradouro": "Avenida EcoByte",
    "numero": "100",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Diadema",
    "estado": "SP",
    "cep": "09900000"
  },
  "localizacao": {
    "type": "Point",
    "coordinates": [
      -46.6228,
      -23.6812
    ]
  }
}
```

Os dados de endereço e coordenadas acima são fictícios e devem ser tratados como dados de demonstração.

---

# 8. Índice Geoespacial

A coleção `ecopoints` deve possuir índice:

```js
{
  localizacao: "2dsphere"
}
```

Exemplo:

```js
db.ecopoints.createIndex({
  localizacao: "2dsphere"
});
```

Esse índice permite testar consultas geoespaciais previstas no projeto.

---

# 9. Coletas

O seed deve criar pelo menos uma coleta em cada estado válido da máquina de estados.

Máquina:

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

---

# 10. Coleta PENDENTE

Esta coleta deve representar uma solicitação recém-criada e ainda sem coletor responsável.

Exemplo conceitual:

```json
{
  "status": "PENDENTE",
  "usuarioId": "<ID_CLIENTE_PF>",
  "coletorId": null,
  "enderecoColeta": {
    "logradouro": "Rua das Palmeiras",
    "numero": "120",
    "complemento": "Casa 2",
    "bairro": "Centro",
    "cidade": "Diadema",
    "estado": "SP",
    "cep": "09900001"
  },
  "itensDescarte": [
    {
      "categoria": "INFORMATICA",
      "quantidade": 2,
      "condicao": "USADO"
    },
    {
      "categoria": "ELETRONICOS",
      "quantidade": 1,
      "condicao": "DANIFICADO"
    }
  ],
  "createdAt": "<DATA>",
  "updatedAt": "<DATA>"
}
```

Campos de progresso ainda não utilizados:

```text
acceptedAt: null
startedAt: null
collectedAt: null
deliveredAt: null
completedAt: null
```

Essa coleta será utilizada para testar:

- listagem de coletas pendentes;
- aceitação pelo coletor;
- concorrência;
- atualização de status.

---

# 11. Coleta ACEITA

Esta coleta já foi atribuída a um coletor.

Exemplo conceitual:

```json
{
  "status": "ACEITA",
  "usuarioId": "<ID_CLIENTE_PF>",
  "coletorId": "<ID_COLETOR>",
  "enderecoColeta": {
    "logradouro": "Rua Verde",
    "numero": "250",
    "complemento": null,
    "bairro": "Jardim Eco",
    "cidade": "Diadema",
    "estado": "SP",
    "cep": "09900002"
  },
  "itensDescarte": [
    {
      "categoria": "INFORMATICA",
      "quantidade": 1,
      "condicao": "USADO"
    }
  ]
}
```

O campo:

```text
coletorId
```

deve obrigatoriamente estar preenchido quando o status for:

```text
ACEITA
```

---

# 12. Coleta A_CAMINHO

Representa uma coleta aceita e já iniciada pelo coletor.

Exemplo conceitual:

```json
{
  "status": "A_CAMINHO",
  "usuarioId": "<ID_CLIENTE_PJ>",
  "coletorId": "<ID_COLETOR>",
  "enderecoColeta": {
    "logradouro": "Avenida Tecnologia",
    "numero": "500",
    "complemento": "Bloco A",
    "bairro": "Distrito Industrial",
    "cidade": "Diadema",
    "estado": "SP",
    "cep": "09900003"
  },
  "itensDescarte": [
    {
      "categoria": "INFORMATICA",
      "quantidade": 8,
      "condicao": "OBSOLETO"
    },
    {
      "categoria": "PERIFERICOS",
      "quantidade": 12,
      "condicao": "USADO"
    }
  ]
}
```

Campos esperados:

```text
acceptedAt: preenchido
startedAt: preenchido
collectedAt: null
deliveredAt: null
completedAt: null
```

---

# 13. Coleta RECOLHIDA

Representa uma coleta cujo material já foi recebido pelo coletor, mas ainda não foi entregue no ecoponto.

Exemplo conceitual:

```json
{
  "status": "RECOLHIDA",
  "usuarioId": "<ID_CLIENTE_PF>",
  "coletorId": "<ID_COLETOR>",
  "enderecoColeta": {
    "logradouro": "Rua dos Eletrônicos",
    "numero": "80",
    "complemento": null,
    "bairro": "Vila Nova",
    "cidade": "Diadema",
    "estado": "SP",
    "cep": "09900004"
  },
  "itensDescarte": [
    {
      "categoria": "CELULARES",
      "quantidade": 4,
      "condicao": "DANIFICADO"
    },
    {
      "categoria": "PERIFERICOS",
      "quantidade": 3,
      "condicao": "USADO"
    }
  ]
}
```

Campos esperados:

```text
acceptedAt: preenchido
startedAt: preenchido
collectedAt: preenchido
deliveredAt: null
completedAt: null
```

---

# 14. Coleta ENTREGUE_ECOPONTO

Representa uma coleta cuja carga já chegou ao ecoponto central EcoByte.

O exemplo abaixo omite o endereço, que é obrigatório. A implementação utiliza o endereço fictício `Avenida Sustentável, 900 — Distrito Industrial, Diadema/SP, CEP 09900006`.

Exemplo:

```json
{
  "status": "ENTREGUE_ECOPONTO",
  "usuarioId": "<ID_CLIENTE_PJ>",
  "coletorId": "<ID_COLETOR>",
  "ecopontoId": "<ID_ECOPONTO>",
  "itensDescarte": [
    {
      "categoria": "MONITORES",
      "quantidade": 2,
      "condicao": "DANIFICADO"
    },
    {
      "categoria": "INFORMATICA",
      "quantidade": 5,
      "condicao": "OBSOLETO"
    }
  ]
}
```

Campos esperados:

```text
acceptedAt: preenchido
startedAt: preenchido
collectedAt: preenchido
deliveredAt: preenchido
completedAt: null
```

---

# 15. Coleta CONCLUIDA

Representa uma coleta completamente processada.

Exemplo conceitual:

```json
{
  "status": "CONCLUIDA",
  "usuarioId": "<ID_CLIENTE_PF>",
  "coletorId": "<ID_COLETOR>",
  "ecopontoId": "<ID_ECOPONTO>",
  "enderecoColeta": {
    "logradouro": "Rua da Reciclagem",
    "numero": "45",
    "complemento": null,
    "bairro": "Centro",
    "cidade": "Diadema",
    "estado": "SP",
    "cep": "09900005"
  },
  "itensDescarte": [
    {
      "categoria": "COMPUTADORES",
      "quantidade": 2,
      "condicao": "OBSOLETO"
    },
    {
      "categoria": "CABOS",
      "quantidade": 10,
      "condicao": "USADO"
    }
  ]
}
```

Campos esperados:

```text
acceptedAt: preenchido
startedAt: preenchido
collectedAt: preenchido
deliveredAt: preenchido
completedAt: preenchido
```

---

# 16. Endereço Histórico

O endereço da coleta deve ser armazenado no próprio documento da coleta.

Exemplo:

```json
{
  "enderecoColeta": {
    "logradouro": "Rua da Reciclagem",
    "numero": "45",
    "bairro": "Centro",
    "cidade": "Diadema",
    "estado": "SP"
  }
}
```

Esse comportamento permite preservar o endereço utilizado no momento da solicitação.

Alterações posteriores no endereço do perfil do cliente não devem modificar automaticamente o endereço histórico de uma coleta já criada.

---

# 17. Categorias de Resíduos

O seed deve utilizar categorias consistentes com o domínio definido em:

```text
docs/02_DOMAIN_MODEL.md
docs/03_BUSINESS_RULES.md
```

Exemplos para demonstração:

```text
INFORMATICA
ELETRONICOS
PERIFERICOS
CELULARES
MONITORES
COMPUTADORES
CABOS
```

O conjunto definitivo de categorias deve continuar centralizado na regra de domínio da aplicação.

O seed não deve criar categorias arbitrárias apenas para aumentar a quantidade de dados.

---

# 18. Condição dos Resíduos

Exemplos utilizados no seed:

```text
USADO
DANIFICADO
OBSOLETO
```

As categorias e valores definitivos devem permanecer consistentes com a implementação do domínio.

---

# 19. Timestamps

As coletas devem possuir timestamps coerentes com seu estado.

Exemplo:

```text
createdAt
  ↓
acceptedAt
  ↓
startedAt
  ↓
collectedAt
  ↓
deliveredAt
  ↓
completedAt
```

Nunca criar uma coleta `PENDENTE` com:

```text
acceptedAt
startedAt
collectedAt
deliveredAt
completedAt
```

preenchidos.

Da mesma forma, uma coleta `CONCLUIDA` deve possuir todo o histórico de timestamps.

A sequência temporal deve ser válida:

```text
createdAt <= acceptedAt
acceptedAt <= startedAt
startedAt <= collectedAt
collectedAt <= deliveredAt
deliveredAt <= completedAt
```

---

# 20. Notificações

O seed deve criar notificações suficientes para demonstrar a funcionalidade.

Exemplos:

```json
{
  "usuarioId": "<ID_CLIENTE_PF>",
  "tipo": "COLETA_CRIADA",
  "titulo": "Coleta solicitada",
  "mensagem": "Sua solicitação de coleta foi registrada com sucesso.",
  "lida": false
}
```

```json
{
  "usuarioId": "<ID_COLETOR>",
  "tipo": "NOVA_COLETA",
  "titulo": "Nova coleta disponível",
  "mensagem": "Uma nova coleta está disponível para atendimento.",
  "lida": false
}
```

```json
{
  "usuarioId": "<ID_CLIENTE_PJ>",
  "tipo": "COLETA_ATUALIZADA",
  "titulo": "Coleta atualizada",
  "mensagem": "O status da sua coleta foi atualizado.",
  "lida": true
}
```

O objetivo é garantir que a interface consiga demonstrar:

```text
notificação não lida
notificação lida
múltiplas notificações
diferentes tipos
ordenação por data
```

---

# 21. Seed de Dados Resumido

Estrutura mínima esperada:

```text
USERS
├── Admin EcoByte
├── Cliente PF
├── Cliente PJ
└── Coletor

ECOPONTS
└── Ecoponto Central EcoByte

COLLECTIONS
├── PENDENTE
├── ACEITA
├── A_CAMINHO
├── RECOLHIDA
├── ENTREGUE_ECOPONTO
└── CONCLUIDA

NOTIFICATIONS
├── Cliente PF
├── Cliente PJ
├── Coletor
└── Admin
```

---

# 22. Relações do Seed

As relações devem respeitar o modelo definido no projeto.

Exemplo conceitual:

```text
Cliente PF
   │
   ├── Coleta PENDENTE
   ├── Coleta RECOLHIDA
   └── Coleta CONCLUIDA

Cliente PJ
   │
   ├── Coleta A_CAMINHO
   └── Coleta ENTREGUE_ECOPONTO

Coletor
   │
   ├── Coleta ACEITA
   ├── Coleta A_CAMINHO
   ├── Coleta RECOLHIDA
   ├── Coleta ENTREGUE_ECOPONTO
   └── Coleta CONCLUIDA

Ecoponto Central
   │
   ├── Coleta ENTREGUE_ECOPONTO
   └── Coleta CONCLUIDA
```

A distribuição pode variar na implementação, desde que todas as regras de domínio sejam respeitadas.

---

# 23. Seed para Teste de Concorrência

Deve existir pelo menos uma coleta:

```text
PENDENTE
```

disponível para testes de concorrência.

Cenário:

```text
Coletor A ──┐
            ├── aceita Coleta PENDENTE
Coletor B ──┘
```

O backend deve garantir que apenas um deles consiga realizar a aceitação.

Resultado esperado:

```text
Primeira operação:
200 OK
```

Segunda operação concorrente:

```text
409 Conflict
```

A coleta deve permanecer associada a apenas um coletor.

---

# 24. Seed para Consultas Geoespaciais

O ecoponto deve possuir coordenadas GeoJSON válidas:

```json
{
  "type": "Point",
  "coordinates": [
    <longitude>,
    <latitude>
  ]
}
```

A ordem obrigatória é:

```text
[longitude, latitude]
```

Nunca utilizar:

```text
[latitude, longitude]
```

O seed deve permitir testar operações como:

```js
db.ecopoints.find({
  localizacao: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [/* longitude */, /* latitude */]
      }
    }
  }
});
```

---

# 25. Seed para Relatórios e Agregações

Para validar as consultas definidas em:

```text
docs/08_MONGODB_QUERIES.md
```

o seed deve possuir variedade suficiente de documentos.

É recomendado que existam:

```text
múltiplos clientes
múltiplas categorias
múltiplos estados de coleta
múltiplas datas
múltiplas quantidades
```

Isso permite testar:

- quantidade de coletas;
- coletas por status;
- coletas por cliente;
- coletas por coletor;
- volume de resíduos;
- resíduos por categoria;
- períodos de atividade;
- distribuição de coletas;
- agregações com `$group`;
- ordenação com `$sort`;
- expansão de arrays com `$unwind`;
- agrupamento temporal;
- consultas geoespaciais.

---

# 26. Dados para Paginação

Além do seed mínimo, pode existir um seed expandido para testes de paginação.

Exemplo:

```text
10 usuários
50 coletas
100 notificações
```

ou quantidade maior conforme a necessidade dos testes.

Esse seed expandido não precisa ser executado sempre.

Estratégia recomendada:

```text
seed:minimal
```

para desenvolvimento cotidiano.

```text
seed:full
```

para testes completos.

---

# 27. Separação entre Seed Mínimo e Seed de Teste

O projeto pode possuir dois níveis de população:

### Seed mínimo

Utilizado normalmente:

```text
1 ADMIN
1 CLIENTE PF
1 CLIENTE PJ
1 COLETOR
1 ECOPONTO
6 COLETAS
algumas notificações
```

### Seed completo

Utilizado para testes:

```text
múltiplos usuários
múltiplas coletas
múltiplos status
múltiplas categorias
múltiplas notificações
datas variadas
dados para paginação
dados para agregações
```

O seed completo deve preservar as mesmas regras de domínio do seed mínimo.

---

# 28. Estratégia de Limpeza

Antes da criação dos dados, o seed pode limpar as coleções relacionadas ao ambiente de desenvolvimento.

Exemplo conceitual:

```js
await Notification.deleteMany({});
await Collection.deleteMany({});
await Ecopoint.deleteMany({});
await User.deleteMany({});
```

A ordem deve levar em consideração dependências e referências.

Caso o projeto utilize documentos relacionados por referência, deve-se garantir que nenhum documento antigo permaneça apontando para entidades removidas.

---

# 29. Não Remover Dados de Produção

O mecanismo de limpeza deve possuir proteção explícita.

Exemplo:

```js
if (process.env.NODE_ENV === 'production') {
  throw new Error(
    'Operação de seed bloqueada em produção.'
  );
}
```

Também é recomendado validar explicitamente a URI do banco utilizada pelo ambiente.

Exemplo conceitual:

```js
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI não definida.');
}
```

---

# 30. Ordem de Execução

A sequência recomendada é:

```text
1. Validar ambiente
2. Conectar ao MongoDB
3. Validar conexão
4. Criar/garantir índices
5. Limpar dados de desenvolvimento
6. Criar usuários
7. Criar ecoponto
8. Criar coletas
9. Criar notificações
10. Executar verificações
11. Exibir resumo
12. Encerrar conexão
```

---

# 31. Validação Pós-Seed

Ao final da execução, o script deve validar se os dados esperados existem.

Exemplos:

```js
const userCount = await User.countDocuments();
const collectionCount = await Collection.countDocuments();
const ecopointCount = await Ecopoint.countDocuments();
const notificationCount = await Notification.countDocuments();
```

Também devem ser verificadas condições específicas.

Exemplo:

```js
const pendingCollection = await Collection.findOne({
  status: "PENDENTE"
});

if (!pendingCollection) {
  throw new Error(
    'Seed inválido: coleta PENDENTE não encontrada.'
  );
}
```

---

# 32. Validação da Máquina de Estados

O seed deve verificar se cada estado esperado está representado.

Exemplo:

```js
const requiredStatuses = [
  "PENDENTE",
  "ACEITA",
  "A_CAMINHO",
  "RECOLHIDA",
  "ENTREGUE_ECOPONTO",
  "CONCLUIDA"
];
```

O script deve confirmar que existe pelo menos uma coleta para cada status.

---

# 33. Validação de Regras de Integridade

Após a execução, devem ser verificadas regras como:

```text
PENDENTE
→ coletorId ausente/nulo

ACEITA
→ coletorId preenchido

A_CAMINHO
→ coletorId preenchido

RECOLHIDA
→ coletorId preenchido

ENTREGUE_ECOPONTO
→ coletorId preenchido
→ ecopontoId preenchido

CONCLUIDA
→ coletorId preenchido
→ ecopontoId preenchido
```

Também devem ser verificadas as regras temporais:

```text
createdAt <= acceptedAt
acceptedAt <= startedAt
startedAt <= collectedAt
collectedAt <= deliveredAt
deliveredAt <= completedAt
```

quando os timestamps existirem.

---

# 34. Credenciais de Desenvolvimento

Para facilitar os testes locais, podem ser utilizadas as credenciais fictícias abaixo:

```text
ADMIN
E-mail: admin@ecobyte.local
Senha: SenhaAdmin123!

CLIENTE PF
E-mail: mariana@ecobyte.local
Senha: ClientePF123!

CLIENTE PJ
E-mail: empresa@ecobyte.local
Senha: ClientePJ123!

COLETOR
E-mail: coletor@ecobyte.local
Senha: Coletor123!
```

Essas credenciais são exclusivamente para ambientes locais/de demonstração.

Nunca reutilizar essas credenciais em produção.

---

# 35. Identidade Visual nos Dados

Os dados do seed devem utilizar textos coerentes com a marca EcoByte.

Exemplos:

```text
Ecoponto Central EcoByte
Administrador EcoByte
Coleta solicitada
Coleta aceita
Coleta a caminho
Coleta recolhida
Entrega realizada no ecoponto
Coleta concluída
```

Evitar nomes genéricos excessivos como:

```text
User 1
User 2
Test User
Test Collection
```

quando existir a possibilidade de criar dados de demonstração semanticamente úteis.

---

# 36. Dados Fictícios e Interface

Os dados do seed devem ser visualmente adequados para a interface.

Por exemplo:

```text
Nomes de tamanho variável
Endereços com e sem complemento
Descrições curtas e médias
Diferentes quantidades de resíduos
Notificações lidas e não lidas
```

Isso ajuda a detectar problemas de:

- truncamento;
- overflow;
- responsividade;
- quebra de layout;
- tabelas;
- cards;
- badges;
- listas;
- componentes mobile.

---

# 37. Cenários que o Seed Deve Permitir Demonstrar

O seed deve permitir executar, no mínimo, os seguintes cenários.

## 37.1 Cliente

```text
Login
↓
Dashboard
↓
Solicitar coleta
↓
Visualizar coleta PENDENTE
↓
Acompanhar alterações
```

## 37.2 Coletor

```text
Login
↓
Dashboard do coletor
↓
Visualizar coleta PENDENTE
↓
Aceitar coleta
↓
Iniciar rota
↓
Confirmar recolhimento
↓
Entregar no ecoponto
↓
Concluir coleta
```

## 37.3 Administrador

```text
Login
↓
Dashboard administrativo
↓
Visualizar usuários
↓
Visualizar coletas
↓
Consultar ecoponto
↓
Consultar relatórios
```

---

# 38. Exemplo de Estrutura do Script

Organização implementada (Fase 2, 2026-09-25):

```text
backend/src/
└── database/
    └── seed/
        ├── index.ts           CLI: carrega ambiente, conecta, executa e imprime o resumo
        ├── data.ts            dados fictícios: usuários, ecoponto, coletas e notificações
        ├── seed.ts            runSeed(): índices, limpeza, criação na ordem do §30
        └── validate-seed.ts   validação pós-seed (§31–§33)
```

O seed é escrito em TypeScript e reutiliza os models Mongoose do backend (`DEC-062`).

`runSeed()` recebe uma data de referência, o que torna os timestamps determinísticos nos testes automatizados (`backend/tests/seed/seed.test.ts`).

Os timestamps de cada coleta são derivados da máquina de estados (`requiredTimestampsFor`), com intervalo de 2 horas entre etapas, garantindo coerência com o status (§19).

A estrutura física definitiva deve seguir:

```text
docs/18_DEVELOPMENT.md
```

e a organização adotada pelo projeto.

---

# 39. Pseudocódigo do Seed

```js
async function seed() {
  validateEnvironment();

  await connectDatabase();

  await clearDevelopmentData();

  await ensureIndexes();

  const users = await createUsers();

  const ecopoint = await createEcopoint();

  const collections = await createCollections({
    users,
    ecopoint
  });

  await createNotifications({
    users,
    collections
  });

  await validateSeed({
    users,
    ecopoint,
    collections
  });

  printSummary();

  await disconnectDatabase();
}
```

---

# 40. Resumo da Execução

Ao finalizar, o terminal deve apresentar um resumo semelhante a:

```text
========================================
EcoByte Seed
========================================

Environment:
development

Users:
  ADMIN:       1
  CLIENTE PF:  1
  CLIENTE PJ:  1
  COLETOR:     1

Ecopoints:
  1

Collections:
  PENDENTE:             1
  ACEITA:               1
  A_CAMINHO:            1
  RECOLHIDA:            1
  ENTREGUE_ECOPONTO:    1
  CONCLUIDA:            1

Notifications:
  8

Validation:
  ✓ Users
  ✓ Ecopoint
  ✓ Collection statuses
  ✓ Relationships
  ✓ Timestamps
  ✓ State machine
  ✓ Required indexes

Seed completed successfully.
========================================
```

---

# 41. Comandos

Os comandos definitivos dependem da configuração do `package.json`.

Script em `backend/package.json`:

```json
{
  "scripts": {
    "seed": "tsx --env-file-if-exists=.env src/database/seed/index.ts"
  }
}
```

Execução a partir da raiz do monorepo:

```bash
npm run seed --workspace backend
```

O seed completo (`seed:full`, §27) ainda não está implementado. Ele será criado junto com as funcionalidades de administração e relatórios, que precisam de volume de dados.

---

# 42. Variáveis de Ambiente

O seed deve utilizar as mesmas configurações de ambiente do backend.

Exemplo:

```env
MONGODB_URI=mongodb://localhost:27017/ecobyte
NODE_ENV=development
```

No arquivo:

```text
.env.example
```

deve existir apenas a estrutura da variável:

```env
MONGODB_URI=
NODE_ENV=development
```

Nunca incluir credenciais reais.

---

# 43. Compatibilidade com MongoDB

O seed deve respeitar integralmente o modelo descrito em:

```text
docs/07_DATABASE_MONGODB.md
```

e as consultas descritas em:

```text
docs/08_MONGODB_QUERIES.md
```

Não criar campos arbitrários que contrariem o modelo documentado.

A flexibilidade do MongoDB não deve ser confundida com ausência de regras de domínio.

---

# 44. Compatibilidade com a API

Os documentos criados pelo seed devem ser consumíveis normalmente pelas rotas documentadas em:

```text
docs/05_ROUTES.md
```

e:

```text
docs/06_API.md
```

Exemplos:

```text
GET /api/v1/collections
GET /api/v1/collections/:id
GET /api/v1/collector/collections
GET /api/v1/notifications
GET /api/v1/admin/users
GET /api/v1/admin/reports
```

Os dados de seed não devem exigir tratamentos especiais na API.

---

# 45. Compatibilidade com Autorização

O seed deve garantir que cada `role` possa ser utilizado para testar o controle de acesso.

Matriz mínima:

```text
ADMIN
  → rotas administrativas

CLIENTE
  → recursos de cliente

COLETOR
  → recursos de coletor
```

O frontend não deve ser considerado responsável por impedir acesso indevido.

A API deve validar:

```text
autenticação
+
role
+
propriedade do recurso
+
regra de negócio
```

---

# 46. Testes de Propriedade dos Recursos

O seed deve permitir testar que um cliente não consegue acessar ou modificar recursos pertencentes a outro cliente.

Exemplo:

```text
Cliente PF
  ↓
tentativa de acessar coleta do Cliente PJ
  ↓
acesso negado
```

Da mesma forma:

```text
Coletor
  ↓
tentativa de modificar coleta não atribuída
  ↓
backend valida regra de negócio
```

Essas situações devem ser cobertas pelos testes definidos em:

```text
docs/17_TESTING.md
```

---

# 47. Seed e Dados de Produção

Dados criados por este documento nunca devem ser confundidos com dados reais.

O sistema de produção deve utilizar:

```text
dados reais
credenciais reais
configurações reais
endereços reais
integrações reais
```

mas nunca copiar automaticamente:

```text
seed de desenvolvimento
```

para produção.

---

# 48. Critérios de Aceitação

O `20_SEED_DATA.md` será considerado atendido quando:

```text
[ ] Existe pelo menos um ADMIN
[ ] Existe pelo menos um CLIENTE PF
[ ] Existe pelo menos um CLIENTE PJ
[ ] Existe pelo menos um COLETOR
[ ] Existe um único ecoponto central
[ ] Existe uma coleta PENDENTE
[ ] Existe uma coleta ACEITA
[ ] Existe uma coleta A_CAMINHO
[ ] Existe uma coleta RECOLHIDA
[ ] Existe uma coleta ENTREGUE_ECOPONTO
[ ] Existe uma coleta CONCLUIDA
[ ] Existem notificações
[ ] As relações entre documentos são válidas
[ ] Os timestamps são coerentes
[ ] A máquina de estados é respeitada
[ ] Existe cenário para teste de concorrência
[ ] Existe dado GeoJSON para teste geoespacial
[ ] Existem dados suficientes para agregações
[ ] O seed não utiliza dados pessoais reais
[ ] O seed não pode executar em produção por padrão
[ ] As senhas não são armazenadas em plaintext
[ ] O seed é reproduzível
[ ] O seed possui validações pós-execução
```

---

# 49. Relação com Outros Documentos

Este documento deve ser utilizado em conjunto com:

```text
docs/02_DOMAIN_MODEL.md
docs/03_BUSINESS_RULES.md
docs/05_ROUTES.md
docs/06_API.md
docs/07_DATABASE_MONGODB.md
docs/08_MONGODB_QUERIES.md
docs/09_AUTHENTICATION_SECURITY.md
docs/13_COLLECTOR_FLOW.md
docs/14_STATE_MACHINE.md
docs/17_TESTING.md
docs/18_DEVELOPMENT.md
docs/19_DEPLOYMENT.md
```

Caso uma regra deste documento entre em conflito com uma regra de domínio ou segurança, deve prevalecer a documentação de domínio/segurança vigente, e o seed deve ser ajustado.

---

# 50. Regra Final

O seed existe para criar um ambiente confiável de desenvolvimento e demonstração.

Ele deve reproduzir o domínio real da aplicação em escala fictícia, permitindo que o projeto seja desenvolvido, testado e apresentado sem depender de dados reais.

A regra central é:

```text
Seed
→ dados fictícios
→ regras reais
→ fluxo real
→ comportamento reproduzível
```

O seed não deve criar atalhos que a aplicação real não permitiria.

Se uma operação é proibida pelas regras de negócio, ela também deve ser proibida nos dados e relacionamentos criados pelo seed.