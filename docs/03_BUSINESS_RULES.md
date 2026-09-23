# 03 — BUSINESS RULES

## 1. Objetivo

Este documento define as regras de negócio do EcoByte.

As regras aqui descritas devem ser consideradas fonte de verdade para:

- Backend
- Frontend
- Banco de dados
- API
- Autenticação
- Fluxo de coleta
- Painéis por perfil
- Validações
- Testes automatizados

Nenhuma regra importante deve ser criada, alterada ou removida silenciosamente durante a implementação.

---

# 2. Perfis de usuário

## BR-001 — Roles do sistema

O sistema possui três roles:

- `CLIENTE`
- `COLETOR`
- `ADMIN`

A `role` determina as permissões do usuário dentro do sistema.

---

## BR-002 — Tipo de cadastro

O cliente pode possuir um dos seguintes tipos de cadastro:

- `PF` — Pessoa Física
- `PJ` — Pessoa Jurídica

O tipo de cadastro é independente da `role`.

Exemplo:

```text
role = CLIENTE
tipo_cadastro = PF
```

ou:

```text
role = CLIENTE
tipo_cadastro = PJ
```

---

## BR-003 — Separação entre role e tipo de cadastro

Não utilizar `tipo_cadastro` para determinar permissões.

As permissões devem ser baseadas exclusivamente na `role`.

```text
role:
    CLIENTE
    COLETOR
    ADMIN

tipo_cadastro:
    PF
    PJ
```

---

# 3. Usuários

## BR-004 — Cadastro de usuário

Todo novo cliente deve informar os dados obrigatórios definidos pelo formulário de cadastro.

O backend deve validar os dados independentemente das validações realizadas no frontend.

---

## BR-005 — E-mail único

O endereço de e-mail deve ser único no sistema.

Não deve ser permitido criar duas contas com o mesmo e-mail.

A comparação deve ser feita de forma consistente, evitando duplicidades causadas apenas por diferenças de capitalização.

---

## BR-006 — Senha

A senha deve possuir, no mínimo:

- 8 caracteres
- 1 letra maiúscula
- 1 letra minúscula
- 1 número
- 1 caractere especial

Exemplo conceitual:

```text
Senha@123
```

A regra deve ser validada no backend.

---

## BR-007 — Senha nunca deve ser armazenada em texto puro

A senha original nunca deve ser armazenada no banco.

O sistema deve armazenar somente um hash seguro da senha.

Campo esperado:

```text
senha_hash
```

Preferência:

```text
Argon2id
```

Alternativa aceitável:

```text
bcrypt
```

---

## BR-008 — Status do usuário

Um usuário pode estar:

```text
ATIVO
INATIVO
```

Usuários `INATIVO` não devem conseguir utilizar funcionalidades protegidas do sistema.

---

# 4. Pessoa Física e Pessoa Jurídica

## BR-009 — Cadastro PF

Clientes `PF` devem possuir os dados específicos definidos para pessoa física.

Exemplo:

```text
tipo_cadastro = PF
documento = CPF
```

---

## BR-010 — Cadastro PJ

Clientes `PJ` devem possuir os dados específicos definidos para pessoa jurídica.

Exemplo:

```text
tipo_cadastro = PJ
documento = CNPJ
dados_empresa:
    razaoSocial
    nomeFantasia
```

Os campos exatos podem ser ajustados conforme os requisitos definitivos do projeto.

---

## BR-011 — Coleta para PF e PJ

Tanto usuários `PF` quanto `PJ` podem solicitar coleta de lixo eletrônico, desde que estejam autenticados e ativos.

---

# 5. Solicitação de coleta

## BR-012 — Cliente autenticado

Somente usuários autenticados podem solicitar uma coleta.

Usuários não autenticados devem ser direcionados para autenticação.

---

## BR-013 — Endereço da coleta

Toda coleta deve possuir um endereço de coleta próprio.

O endereço deve ser armazenado dentro do documento da coleta.

Exemplo:

```text
Coleta
├── usuarioId
├── enderecoColeta
└── itensDescarte
```

Isso garante que o endereço histórico da coleta permaneça preservado mesmo que o cliente altere seu endereço posteriormente.

---

## BR-014 — Itens de descarte

Uma coleta deve possuir pelo menos um item de lixo eletrônico.

Cada item deve conter informações como:

```text
categoria
quantidade
condicao
```

A estrutura pode ser expandida posteriormente conforme os requisitos do projeto.

---

## BR-015 — Registro histórico

Depois que uma coleta for criada, seus dados históricos essenciais não devem depender exclusivamente dos dados atuais do usuário.

A coleta deve preservar pelo menos:

- endereço utilizado
- itens descartados
- usuário responsável
- coletor responsável, quando houver
- datas relevantes
- status

---

# 6. Status das coletas

## BR-016 — Máquina de estados oficial

Uma coleta possui exatamente um status principal.

Os status oficiais são:

```text
PENDENTE
ACEITA
A_CAMINHO
RECOLHIDA
ENTREGUE_ECOPONTO
CONCLUIDA
```

Não criar novos status sem atualizar este documento e os documentos relacionados.

---

## BR-017 — Estado inicial

Toda nova solicitação de coleta deve ser criada com:

```text
status = PENDENTE
```

Nesse momento, nenhum coletor está associado à coleta.

```text
coletorId = null
```

---

## BR-018 — Fluxo permitido

As transições válidas são exclusivamente:

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

## BR-019 — Não permitir saltos de estado

Uma coleta não pode avançar diretamente entre estados não consecutivos.

Exemplo inválido:

```text
PENDENTE → RECOLHIDA
```

Exemplo inválido:

```text
ACEITA → CONCLUIDA
```

A transição deve seguir a máquina de estados definida.

---

## BR-020 — Não permitir retorno de estado

Uma coleta não deve retornar para um estado anterior.

Exemplo:

```text
A_CAMINHO → ACEITA
```

é inválido.

---

# 7. Aceite da coleta pelo coletor

## BR-021 — Somente coletor pode aceitar

A transição:

```text
PENDENTE → ACEITA
```

somente pode ser realizada por um usuário com:

```text
role = COLETOR
```

e status:

```text
ATIVO
```

---

## BR-022 — Associação do coletor

Ao aceitar uma coleta, o sistema deve registrar o `coletorId`.

Exemplo:

```text
status = ACEITA
coletorId = ID_DO_COLETOR
acceptedAt = data/hora atual
```

---

## BR-023 — Uma coleta possui apenas um coletor responsável

Depois que uma coleta for aceita, somente um coletor deve estar associado a ela.

Outro coletor não deve assumir a mesma coleta.

---

## BR-024 — Concorrência na aceitação

Se dois coletores tentarem aceitar simultaneamente a mesma coleta `PENDENTE`, somente uma operação poderá ser concluída.

A segunda tentativa deve falhar com:

```text
HTTP 409 Conflict
```

O backend deve garantir essa regra de forma atômica.

---

# 8. Início da rota

## BR-025 — Iniciar coleta

Somente o coletor associado à coleta pode realizar:

```text
ACEITA → A_CAMINHO
```

Ao iniciar:

```text
status = A_CAMINHO
startedAt = data/hora atual
```

---

## BR-026 — Coletor não associado

Um coletor não associado à coleta não pode iniciar sua rota.

---

# 9. Recolhimento

## BR-027 — Confirmar recolhimento

Somente o coletor responsável pode realizar:

```text
A_CAMINHO → RECOLHIDA
```

Ao confirmar:

```text
status = RECOLHIDA
collectedAt = data/hora atual
```

---

# 10. Entrega no ecoponto

## BR-028 — Ecoponto central EcoByte

O MVP considera apenas um ecoponto físico central:

```text
EcoByte
```

Não existe, no MVP, uma rede de ecopontos de terceiros.

---

## BR-029 — Entrega no ecoponto

Após a coleta ser realizada, o coletor deve entregar os materiais no ecoponto central da EcoByte.

A transição permitida é:

```text
RECOLHIDA → ENTREGUE_ECOPONTO
```

Ao registrar a entrega:

```text
status = ENTREGUE_ECOPONTO
deliveredAt = data/hora atual
```

---

# 11. Conclusão da coleta

## BR-030 — Finalização

Após a confirmação da entrega no ecoponto, a coleta pode ser finalizada:

```text
ENTREGUE_ECOPONTO → CONCLUIDA
```

Ao finalizar:

```text
status = CONCLUIDA
completedAt = data/hora atual
```

---

## BR-031 — Coleta concluída

Uma coleta com:

```text
status = CONCLUIDA
```

é considerada encerrada.

Ela não deve retornar para qualquer estado anterior.

---

# 12. Permissões

## BR-032 — Acesso baseado em role

O backend deve validar permissões em todas as rotas protegidas.

Nunca confiar somente no frontend para impedir acesso indevido.

---

## BR-033 — Cliente

O cliente pode:

- visualizar seu próprio perfil
- atualizar seus próprios dados permitidos
- solicitar coleta
- visualizar suas próprias coletas
- visualizar detalhes das suas coletas
- acompanhar o status das suas coletas
- visualizar informações do ecoponto EcoByte

O cliente não pode:

- aceitar coletas de terceiros
- alterar o status operacional de uma coleta
- acessar dados administrativos
- administrar usuários
- modificar o cadastro do ecoponto

---

## BR-034 — Coletor

O coletor pode:

- visualizar coletas disponíveis
- aceitar uma coleta
- iniciar a rota da coleta aceita
- confirmar o recolhimento
- confirmar a entrega no ecoponto
- visualizar informações necessárias para executar suas coletas

O coletor não pode:

- administrar usuários
- alterar dados administrativos
- aceitar uma coleta já atribuída a outro coletor
- alterar diretamente uma coleta para um estado inválido

---

## BR-035 — Administrador

O administrador possui permissões administrativas para:

- gerenciar usuários
- visualizar coletas
- consultar informações gerais do sistema
- gerenciar o ecoponto
- acessar relatórios
- executar operações administrativas previstas pelo sistema

As permissões administrativas devem permanecer restritas ao backend.

---

# 13. Ecoponto

## BR-036 — Existência do ecoponto central

O sistema deve possuir um ecoponto central representando a estrutura física da EcoByte.

---

## BR-037 — Dados do ecoponto

O ecoponto pode possuir informações como:

```text
nome
descricao
endereco
localizacao
horarios
status
```

Os valores definitivos devem ser definidos nos documentos de requisitos/configuração do projeto.

---

## BR-038 — Status do ecoponto

O ecoponto pode possuir estado operacional:

```text
ATIVO
INATIVO
```

Um ecoponto inativo não deve ser apresentado como disponível para operações que dependam de seu funcionamento.

---

# 14. Endereço e localização

## BR-039 — Geolocalização

Quando houver coordenadas geográficas, utilizar GeoJSON:

```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

A ordem das coordenadas deve ser obrigatoriamente:

```text
[longitude, latitude]
```

e não:

```text
[latitude, longitude]
```

---

## BR-040 — Índice geoespacial

Campos de localização utilizados para buscas geográficas devem utilizar índice:

```text
2dsphere
```

---

# 15. Notificações

## BR-041 — Notificações relacionadas às coletas

O sistema pode registrar notificações relacionadas a eventos importantes da coleta.

Exemplos:

```text
coleta aceita
coleta em andamento
coleta recolhida
coleta entregue no ecoponto
coleta concluída
```

O conteúdo e os gatilhos definitivos devem permanecer alinhados ao fluxo real implementado.

---

## BR-042 — Leitura de notificações

Uma notificação deve possuir informação suficiente para determinar se foi lida ou não.

Exemplo:

```text
lida = true
```

ou:

```text
lida = false
```

---

# 16. Integridade e histórico

## BR-043 — Preservação de histórico

Dados relevantes para o histórico operacional não devem ser removidos de forma que impossibilitem a reconstrução da coleta.

---

## BR-044 — Exclusão lógica

Para recursos que possuem histórico importante, preferir desativação lógica em vez de exclusão física.

Exemplo:

```text
status = INATIVO
```

em vez de remover permanentemente o documento.

---

## BR-045 — Timestamps

As entidades relevantes devem manter datas de criação e atualização:

```text
createdAt
updatedAt
```

As coletas devem manter também os timestamps específicos do fluxo quando aplicável:

```text
acceptedAt
startedAt
collectedAt
deliveredAt
completedAt
```

---

# 17. Validação

## BR-046 — Frontend e backend

As validações devem existir em duas camadas:

```text
Frontend
↓
Backend
```

A validação do frontend é voltada à experiência do usuário.

A validação do backend é obrigatória para garantir integridade e segurança.

---

## BR-047 — Dados inválidos

Dados inválidos não devem ser persistidos no banco.

O backend deve responder com erro HTTP apropriado e mensagem clara.

---

# 18. Banco de dados

## BR-048 — MongoDB

O banco de dados oficial do projeto deve ser:

```text
MongoDB
```

---

## BR-049 — Backend como intermediário

O frontend nunca deve acessar diretamente o MongoDB.

Fluxo obrigatório:

```text
Frontend
    ↓
HTTP
    ↓
Backend
    ↓
MongoDB
```

---

## BR-050 — Regras de negócio no backend

Regras de negócio críticas devem ser implementadas no backend.

Exemplos:

- permissões
- autenticação
- autorização
- transições de status
- associação do coletor
- validação de dados
- integridade de operações

O frontend não deve ser a única barreira dessas regras.

---

# 19. Concorrência e consistência

## BR-051 — Operações concorrentes

Operações que alterem o estado de uma coleta devem verificar o estado atual antes de realizar a alteração.

---

## BR-052 — Estado esperado

Uma operação de transição deve possuir um estado de origem válido.

Exemplo:

Para aceitar:

```text
status atual = PENDENTE
```

Somente então:

```text
status novo = ACEITA
```

---

## BR-053 — Falha de concorrência

Caso o estado da coleta tenha mudado entre a leitura e a tentativa de atualização, a operação deve falhar em vez de sobrescrever a alteração realizada por outro usuário.

---

# 20. Regras de segurança

## BR-054 — Autorização no backend

Todas as operações protegidas devem verificar:

1. autenticação
2. identidade do usuário
3. role
4. permissões sobre o recurso

---

## BR-055 — Dados sensíveis

Não retornar dados sensíveis desnecessariamente nas respostas da API.

O hash da senha nunca deve ser enviado ao frontend.

---

## BR-056 — Segredos

Credenciais, chaves, tokens e informações sensíveis não devem ser armazenados diretamente no código-fonte.

Utilizar variáveis de ambiente.

Exemplo:

```text
.env
.env.example
```

---

# 21. Regras de evolução do sistema

## BR-057 — Alteração de regras

Alterações importantes nas regras de negócio devem ser registradas em:

```text
docs/DECISIONS.md
```

quando representarem uma decisão arquitetural ou de produto relevante.

---

## BR-058 — Alteração da máquina de estados

Qualquer alteração nos status ou nas transições das coletas deve atualizar, no mínimo:

```text
03_BUSINESS_RULES.md
14_STATE_MACHINE.md
06_API.md
```

e os testes relacionados.

---

## BR-059 — Novas funcionalidades

Novas funcionalidades não devem introduzir regras contraditórias às regras já estabelecidas.

Quando existir conflito, a documentação deve ser atualizada antes da implementação.

---

# 22. Regra geral

## BR-060 — Fonte de verdade

Este documento representa a fonte de verdade das regras de negócio do EcoByte.

Em caso de dúvida:

```text
documentação atual
    ↓
regras de negócio
    ↓
implementação
```

A implementação deve refletir as regras documentadas e não criar comportamentos de negócio arbitrários.