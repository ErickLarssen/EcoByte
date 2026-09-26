# EcoByte — Domain Model

## 1. Visão Geral

O domínio do EcoByte é formado pelas entidades responsáveis por representar:

- usuários;
- solicitações de coleta;
- itens de descarte;
- endereço da coleta;
- ecoponto;
- notificações.

O sistema possui três papéis operacionais:

- `CLIENTE`
- `COLETOR`
- `ADMIN`

O tipo de cadastro do cliente é independente do seu papel:

- `PF`
- `PJ`

---

## 2. Usuário

A entidade `Usuario` representa qualquer pessoa autenticada no sistema.

### Campos principais

```text
_id
nome
email
senhaHash
telefone
documento
role
tipoCadastro
dadosEmpresa
status
createdAt
updatedAt
```

### `role`

Define o papel operacional do usuário:

```text
CLIENTE
COLETOR
ADMIN
```

### `tipoCadastro`

Define a natureza do cadastro:

```text
PF
PJ
```

`tipoCadastro` e `role` são propriedades diferentes e não devem ser combinadas em um único campo.

---

## 3. Pessoa Física

Quando:

```text
tipoCadastro = PF
```

o cadastro representa uma pessoa física.

Informações específicas podem incluir:

- CPF;
- nome completo;
- telefone.

Os campos definitivos devem seguir os requisitos funcionais do projeto.

---

## 4. Pessoa Jurídica

Quando:

```text
tipoCadastro = PJ
```

o cadastro representa uma empresa ou instituição.

Informações específicas podem incluir:

- CNPJ;
- razão social;
- nome fantasia;
- responsável;
- telefone.

Esses dados podem ser organizados em um objeto `dadosEmpresa`.

---

## 5. Status do Usuário

Um usuário pode possuir estados como:

```text
ATIVO
INATIVO
```

Usuários inativos:

- não podem realizar login;
- não podem criar novas solicitações;
- mantêm seus registros históricos.

A desativação deve ser preferida à exclusão física quando houver dados relacionados.

---

## 6. Coleta

A entidade `Coleta` representa uma solicitação de recolhimento de lixo eletrônico.

### Campos conceituais

```text
_id
usuarioId
coletorId
ecopontoId
enderecoColeta
itensDescarte
dataAgendada
status
observacoes
createdAt
updatedAt
acceptedAt
startedAt
collectedAt
deliveredAt
completedAt
```

---

## 7. Relacionamento com Usuário

Cada coleta pertence a um único usuário solicitante.

```text
Usuario 1 ─── N Coletas
```

A identificação do usuário deve ocorrer por referência, utilizando seu identificador.

---

## 8. Relacionamento com Coletor

Uma coleta pode possuir um coletor responsável.

```text
Coletor 1 ─── N Coletas
```

Enquanto a coleta estiver:

```text
PENDENTE
```

ela não deve possuir coletor responsável.

Após ser aceita:

```text
ACEITA
```

o campo `coletorId` deve identificar o coletor responsável.

---

## 9. Endereço da Coleta

O endereço deve ser armazenado dentro do documento de `Coleta`.

Exemplo:

```json
{
  "enderecoColeta": {
    "logradouro": "Rua Exemplo",
    "numero": "100",
    "complemento": "Apto 12",
    "bairro": "Centro",
    "cidade": "Diadema",
    "estado": "SP",
    "cep": "09900000",
    "localizacao": {
      "type": "Point",
      "coordinates": [
        -46.000000,
        -23.000000
      ]
    }
  }
}
```

### Motivo

O endereço deve representar o local da coleta no momento em que ela foi criada.

Se o usuário alterar posteriormente seu endereço de perfil, o histórico da coleta não pode ser alterado.

---

## 10. Geolocalização

Quando utilizada, a localização deve seguir o formato GeoJSON:

```json
{
  "type": "Point",
  "coordinates": [
    longitude,
    latitude
  ]
}
```

A ordem das coordenadas deve ser sempre:

```text
longitude
latitude
```

O campo geográfico deverá utilizar um índice `2dsphere` quando consultas geoespaciais forem implementadas.

---

## 11. Itens de Descarte

Uma coleta pode possuir vários itens de descarte.

Os itens devem ser representados como um array de objetos embutidos.

Exemplo:

```json
[
  {
    "categoria": "INFORMATICA",
    "quantidade": 1,
    "condicao": "USADO"
  },
  {
    "categoria": "CABOS",
    "quantidade": 5,
    "condicao": "DANIFICADO"
  }
]
```

Os valores de `categoria` e `condicao` acima são provisórios (`OQ-007`, `OQ-010`).

### Informações mínimas

Cada item deve possuir:

```text
categoria
quantidade
condicao
```

Os três campos são obrigatórios, conforme `BR-014`, `RF-016`, `07_DATABASE_MONGODB.md` §23 e `DEC-009` (alinhamento de 2026-09-25).

A quantidade deve ser maior que zero.

Enquanto `OQ-007` e `OQ-010` estiverem abertas, `categoria` e `condicao` são textos obrigatórios normalizados em maiúsculas, sem lista fechada de valores.

---

## 12. Ecoponto

A entidade `Ecoponto` representa o espaço físico operado pelo próprio EcoByte.

No MVP existe:

```text
1 Ecoponto EcoByte
```

O sistema não representa uma rede de ecopontos de terceiros.

### Campos conceituais

```text
_id
nome
endereco
localizacao
horarios
capacidade
status
createdAt
updatedAt
```

---

## 13. Relacionamento com o Ecoponto

A coleta possui como destino o ecoponto físico EcoByte.

Conceitualmente:

```text
Coleta N ─── 1 Ecoponto
```

A referência é registrada no campo `ecopontoId`, preenchido na transição `RECOLHIDA → ENTREGUE_ECOPONTO` com o ecoponto central ativo (`DEC-053`). Antes disso, `ecopontoId = null`.

Como o MVP possui apenas um ecoponto, a implementação não deve introduzir complexidade desnecessária para seleção entre vários pontos.

A arquitetura poderá ser expandida futuramente.

---

## 14. Notificação

A entidade `Notificacao` representa mensagens relacionadas à atividade do sistema.

### Campos conceituais

```text
_id
usuarioId
tipo
titulo
mensagem
lida
createdAt
```

### Exemplos

- coleta aceita;
- coleta a caminho;
- recolhimento confirmado;
- entrega realizada;
- coleta concluída.

---

## 15. Relacionamentos Gerais

```text
Usuario 1 ─── N Coletas
Usuario 1 ─── N Notificacoes

Coletor 1 ─── N Coletas

Coleta N ─── 1 Ecoponto
```

Os dados de endereço e itens de descarte pertencem diretamente à coleta.

---

## 16. Embedding vs Referência

### Utilizar dados embutidos quando:

- pertencem diretamente ao documento principal;
- são utilizados junto com o documento;
- precisam preservar o estado histórico;
- não possuem ciclo de vida independente.

Exemplos:

```text
Coleta
 ├── enderecoColeta
 └── itensDescarte
```

### Utilizar referências quando:

- a entidade possui ciclo de vida próprio;
- é reutilizada em vários documentos;
- precisa ser consultada independentemente.

Exemplos:

```text
Coleta → Usuario
Coleta → Coletor
Coleta → Ecoponto
Notificacao → Usuario
```

---

## 17. Histórico

A `Coleta` deve preservar os dados relevantes do processo:

- usuário solicitante;
- coletor responsável;
- endereço;
- itens;
- status;
- datas das etapas;
- observações.

Alterações futuras no cadastro do usuário não devem modificar o histórico já registrado na coleta.

---

## 18. Regras de Integridade

O modelo deve garantir, no backend:

- e-mail único para usuários;
- `role` válido;
- `tipoCadastro` válido;
- quantidade de itens maior que zero;
- referências válidas;
- status de coleta válido;
- transições de status válidas;
- somente um coletor responsável por coleta;
- dados obrigatórios preenchidos.

---

## 19. Flexibilidade do MongoDB

O MongoDB permite documentos com estruturas flexíveis.

Entretanto, flexibilidade não significa ausência de regras.

O Mongoose deve ser utilizado para definir:

- schemas;
- validações;
- defaults;
- enums;
- índices;
- relacionamentos por referência quando necessários.

A flexibilidade do documento deve ser utilizada de forma consciente.

---

## 20. Papéis e Responsabilidades

### CLIENTE

Pode:

- gerenciar seu próprio perfil;
- criar solicitações;
- visualizar suas solicitações;
- acompanhar suas coletas;
- visualizar seu histórico;
- receber notificações.

### COLETOR

Pode:

- visualizar coletas disponíveis;
- assumir coletas;
- atualizar estados permitidos;
- confirmar recolhimento;
- registrar entrega no ecoponto.

### ADMIN

Pode:

- gerenciar usuários;
- acompanhar coletas;
- gerenciar informações do ecoponto;
- consultar relatórios;
- executar ações administrativas autorizadas.

As permissões completas estão documentadas em:

`docs/03_BUSINESS_RULES.md`

---

## 21. Modelo Conceitual

```text
                         ┌──────────────┐
                         │   Usuario    │
                         └──────┬───────┘
                                │
                                │ 1:N
                                ↓
                         ┌──────────────┐
                         │    Coleta    │
                         └──────┬───────┘
                                │
               ┌────────────────┼────────────────┐
               │                │                │
               ↓                ↓                ↓
       enderecoColeta     itensDescarte      Ecoponto
          (embedded)         (embedded)          │
                                                 │
                                                 ↓
                                           EcoByte físico

Coleta ───────────────→ Coletor
   N                        1

Usuario ──────────────→ Notificacao
   1                        N
```

---

## 22. Fonte de Verdade

As regras específicas de negócio devem ser consultadas em:

`docs/03_BUSINESS_RULES.md`

O ciclo de vida de uma coleta deve ser consultado em:

`docs/14_STATE_MACHINE.md`

A estrutura persistida no MongoDB deve ser definida em:

`docs/07_DATABASE_MONGODB.md`

Decisões arquiteturais devem ser registradas em:

`docs/DECISIONS.md`

Questões ainda indefinidas devem ser registradas em:

`docs/OPEN_QUESTIONS.md`