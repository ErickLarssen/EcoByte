# OPEN_QUESTIONS — Questões em Aberto

## 1. Objetivo

Este documento reúne decisões, definições e informações que ainda não foram formalmente estabelecidas no projeto EcoByte.

Seu objetivo é impedir que informações ainda indefinidas sejam tratadas como requisitos definitivos.

Quando uma questão for resolvida, ela deve:

```text
1. ser registrada em DECISIONS.md;
2. receber uma decisão formal;
3. ter o status atualizado;
4. atualizar os documentos afetados;
5. atualizar a implementação e os testes, quando necessário.
```

---

# 2. Status

As questões utilizam os seguintes status:

```text
ABERTA
EM DISCUSSAO
DECIDIDA
BLOQUEADA
```

### ABERTA

Ainda não foi definida.

### EM DISCUSSAO

Existem alternativas sendo avaliadas.

### DECIDIDA

A questão já foi resolvida e deve ser movida para `DECISIONS.md`.

### BLOQUEADA

A decisão depende de alguma informação externa, requisito acadêmico, infraestrutura ou definição do negócio.

---

# 3. Regra Fundamental

Uma questão registrada neste documento não deve ser transformada automaticamente em requisito.

Exemplo:

```text
Questão:
"Deve existir confirmação de e-mail?"
```

Não assumir:

```text
"Sim, a confirmação será obrigatória."
```

até que exista uma decisão formal.

Enquanto isso, a implementação deve utilizar somente o comportamento já definido pelos documentos atuais.

---

# 4. Questões Prioritárias

As principais questões ainda abertas são:

```text
1. Verificação de e-mail
2. ~~Mecanismo definitivo de autenticação/sessão~~ (DECIDIDA → DEC-021)
3. Endereço definitivo do ecoponto
4. Coordenadas definitivas do ecoponto
5. Horários de funcionamento do ecoponto
6. Horários permitidos para coleta
7. Categorias definitivas de resíduos
8. Quantidade máxima de resíduos por coleta
9. Aquisição da localização geográfica
10. Sistema de notificações
11. Provedor de recuperação de senha
12. Relatórios administrativos definitivos
13. Parceiros e integrações reais
```

---

# 5. OQ-001 — Verificação de E-mail

**Status:** ABERTA

## Questão

O cadastro de usuário deverá exigir confirmação do endereço de e-mail?

Possibilidades:

```text
A) Sim, obrigatória antes do acesso à plataforma

B) Sim, mas permitindo acesso limitado antes da confirmação

C) Não, sem confirmação no MVP
```

## Impactos

Essa decisão afeta:

```text
autenticação
cadastro
modelo de usuário
notificações
recuperação de senha
fluxo de onboarding
testes
```

## Documentos afetados

```text
03_BUSINESS_RULES.md
04_REQUIREMENTS.md
06_API.md
09_AUTHENTICATION_SECURITY.md
17_TESTING.md
20_SEED_DATA.md
```

---

# 6. OQ-002 — Mecanismo Definitivo de Sessão/Token

**Status:** DECIDIDA

**Decisão:** `DEC-021` (2026-09-24) — sessão no servidor com `express-session`, store no MongoDB e cookie HttpOnly `SameSite=Lax`. Topologia em `DEC-063`.

Permanecem abertas: `OQ-060` (sessões simultâneas) e `OQ-062` (expiração).

O texto abaixo é mantido como registro histórico.

## Questão

Qual estratégia será utilizada para manter a autenticação do usuário?

Alternativas a avaliar:

```text
Sessão tradicional
```

ou:

```text
Token de autenticação
```

A implementação deverá considerar prioritariamente mecanismos seguros, incluindo a possibilidade de utilização de:

```text
cookie HTTP-only
```

## Impactos

A decisão afeta:

```text
login
logout
middleware de autenticação
frontend
backend
cookies
CORS
proteção contra ataques
testes
deploy
```

## Documentos afetados

```text
06_API.md
09_AUTHENTICATION_SECURITY.md
18_DEVELOPMENT.md
19_DEPLOYMENT.md
17_TESTING.md
```

---

# 7. OQ-003 — Endereço Definitivo do Ecoponto

**Status:** ABERTA

**Comportamento enquanto aberta (2026-09-30, `DEC-076`):** o endereço vem do seed e pode ser alterado pelo administrador em `/admin/ecoponto`.

## Questão

Qual será o endereço real ou acadêmico oficialmente utilizado para representar o ecoponto central EcoByte?

O MVP atualmente prevê:

```text
1 único ecoponto central
```

O endereço definitivo ainda não foi estabelecido.

## Informações necessárias

```text
logradouro
número
complemento
bairro
cidade
estado
CEP
ponto de referência
```

## Impactos

Afeta:

```text
ecoponto
mapa
interface
consultas
seed
documentação
apresentação acadêmica
```

---

# 8. OQ-004 — Coordenadas Definitivas do Ecoponto

**Status:** ABERTA

**Comportamento enquanto aberta (2026-09-30, `DEC-076`):** as coordenadas vêm do seed e podem ser alteradas ou removidas pelo administrador.

## Questão

Quais coordenadas serão utilizadas para o `GeoJSON Point` do ecoponto?

Formato esperado:

```json
{
  "type": "Point",
  "coordinates": [
    longitude,
    latitude
  ]
}
```

As coordenadas utilizadas atualmente no seed são exclusivamente fictícias.

Elas deverão ser substituídas quando o endereço definitivo for estabelecido.

## Impactos

Afeta:

```text
GeoJSON
2dsphere
consultas geoespaciais
mapas
seed
testes
```

---

# 9. OQ-005 — Horário de Funcionamento do Ecoponto

**Status:** ABERTA

**Comportamento enquanto aberta (2026-09-30, `DEC-076`):** `horarios` não é aceito pelo `PATCH /api/v1/ecopoint`, e a interface mostra "Horários de funcionamento a definir.". Decidir esta questão inclui definir o formato dos horários.

## Questão

Quais serão os dias e horários de funcionamento do ecoponto central?

Informações necessárias:

```text
dias de funcionamento
horário de abertura
horário de fechamento
feriados
intervalos
```

## Impactos

Pode afetar:

```text
entrega da coleta
fluxo do coletor
agendamento
validações
mensagens de interface
```

---

# 10. OQ-006 — Horários Permitidos para Coleta

**Status:** ABERTA

## Questão

As solicitações de coleta poderão ocorrer em qualquer horário ou existirão janelas específicas?

Possibilidades:

```text
coleta em horário comercial
janelas de horário
agendamento
dia + período
sem agendamento no MVP
```

## Impactos

A decisão poderá alterar:

```text
modelo de Collection
frontend
backend
regras de disponibilidade
fluxo do coletor
notificações
```

---

# 11. OQ-007 — Categorias Definitivas de Resíduos

**Status:** ABERTA

## Questão

Quais categorias oficiais de resíduos eletrônicos estarão disponíveis na aplicação?

O seed utiliza exemplos como:

```text
INFORMATICA
ELETRONICOS
PERIFERICOS
CELULARES
MONITORES
COMPUTADORES
CABOS
```

Esses valores são provisórios para desenvolvimento.

**Comportamento enquanto aberta (2026-09-25):** `categoria` aceita qualquer texto não vazio, normalizado em maiúsculas. O enum oficial será aplicado no schema e na API quando esta questão for decidida.

**Interface (2026-09-27, `DEC-073`):** o formulário de solicitação sugere os valores provisórios do seed, mas aceita qualquer texto.

## Questões a definir

```text
Quais categorias existirão?
As categorias serão fixas?
O administrador poderá adicionar categorias?
Haverá categorias agrupadoras?
```

## Impactos

Afeta:

```text
Collection
itensDescarte
formulários
filtros
relatórios
agregações
seed
```

---

# 12. OQ-008 — Quantidade Máxima de Resíduos

**Status:** ABERTA

## Questão

Existe limite máximo para a quantidade de resíduos registrada em uma coleta?

Possibilidades:

```text
sem limite no MVP
limite por categoria
limite total de itens
limite por peso
limite por volume
```

## Impactos

Pode afetar:

```text
modelo de dados
validação
formulário
regras de negócio
API
interface
```

---

# 13. OQ-009 — Unidade de Quantidade dos Resíduos

**Status:** ABERTA

**Comportamento enquanto aberta (2026-09-27, `DEC-073`):** o formulário do cliente pede a quantidade em unidades inteiras (mínimo 1). A API segue aceitando qualquer número positivo.

## Questão

O campo:

```text
quantidade
```

representará o número de unidades físicas ou alguma outra medida?

Possibilidades:

```text
unidades
quilogramas
volume
mistura de unidade + quantidade
```

Atualmente o modelo utiliza:

```text
quantidade: number
```

mas a unidade de medida ainda não foi formalmente definida.

## Impactos

Afeta:

```text
Collection.itensDescarte
formulário
relatórios
agregações
interface
```

---

# 14. OQ-010 — Condições Possíveis dos Resíduos

**Status:** ABERTA

## Questão

Quais serão os valores oficiais do campo:

```text
condicao
```

O seed utiliza:

```text
USADO
DANIFICADO
OBSOLETO
```

Esses valores devem ser confirmados antes da implementação final.

**Comportamento enquanto aberta (2026-09-25):** `condicao` é obrigatória e aceita qualquer texto não vazio, normalizado em maiúsculas. Nenhuma lista fechada é imposta pelo schema.

**Interface (2026-09-27, `DEC-073`):** o formulário sugere USADO, DANIFICADO e OBSOLETO, mas aceita qualquer texto.

## Questões adicionais

Determinar se será permitido:

```text
funcionando
sem uso
incompleto
sucateado
```

ou outras condições.

---

# 15. OQ-011 — Aquisição da Localização do Usuário

**Status:** ABERTA

## Questão

A plataforma deverá utilizar a localização atual do usuário?

Possibilidades:

```text
A) Não utilizar geolocalização do cliente

B) Utilizar somente para facilitar o preenchimento do endereço

C) Utilizar para encontrar o ecoponto

D) Utilizar para auxiliar o cálculo/ordenação das coletas

E) Utilizar para múltiplas funcionalidades
```

## Impactos

Pode envolver:

```text
Geolocation API
permissões do navegador
privacidade
UX mobile
GeoJSON
consultas MongoDB
```

Nenhuma dessas opções deve ser implementada como requisito definitivo antes da decisão.

---

# 16. OQ-012 — Notificações em Tempo Real

**Status:** DECIDIDA

**Decidido em `DEC-077` (2026-09-30):** consulta periódica. O frontend consulta o contador de não lidas a cada 60 s com a aba visível e ao voltar para a aba. SSE e WebSocket não serão usados; adotá-los exigirá uma nova decisão.

## Questão

As notificações serão apenas persistidas e consultadas pelo cliente ou deverão aparecer em tempo real?

Possibilidades:

```text
consultas periódicas
polling
Server-Sent Events
WebSocket
outra solução
```

## Funcionalidade mínima já prevista

O sistema deve permitir representar:

```text
notificação lida
notificação não lida
histórico
```

A estratégia de atualização em tempo real ainda não foi definida.

---

# 17. OQ-013 — Tipos Definitivos de Notificação

**Status:** ABERTA (parcialmente decidida)

**Decidido em `DEC-077` (2026-09-30):** o cliente é notificado a cada etapa da coleta: `COLETA_ACEITA`, `COLETA_A_CAMINHO`, `COLETA_RECOLHIDA`, `COLETA_ENTREGUE_ECOPONTO` e `COLETA_CONCLUIDA`. Continuam em aberto `COLETA_CRIADA`, `NOVA_COLETA` (aviso aos coletores) e notificações de outros perfis. Elas existem apenas no seed de demonstração.

## Questão

Quais eventos deverão gerar notificações?

Possíveis exemplos:

```text
COLETA_CRIADA
COLETA_ACEITA
COLETA_A_CAMINHO
COLETA_RECOLHIDA
COLETA_ENTREGUE_ECOPONTO
COLETA_CONCLUIDA
NOVA_COLETA
```

A lista acima é apenas uma proposta inicial baseada no fluxo existente.

A lista oficial ainda precisa ser consolidada.

---

# 18. OQ-014 — Provedor de E-mail

**Status:** ABERTA

## Questão

Qual serviço será utilizado para envio de e-mails?

Possibilidades a avaliar:

```text
serviço SMTP
provedor transacional
serviço acadêmico
serviço gratuito
provedor cloud
```

## Possíveis funcionalidades dependentes

```text
confirmação de e-mail
recuperação de senha
notificações por e-mail
```

A escolha deve considerar:

```text
custo
limites
facilidade de integração
segurança
ambiente de desenvolvimento
ambiente de produção
```

---

# 19. OQ-015 — Recuperação de Senha

**Status:** ABERTA

**Diagrama de navegação (2026-10-03):** o diagrama de navegação (`public/images/diagrama-navegacao.png`, `DEC-079`) prevê "Recuperar Senha" no fluxo de login. Continua indisponível até esta questão e a OQ-014 serem decididas.

## Questão

Qual infraestrutura será utilizada para enviar o token temporário de recuperação?

A regra de negócio já estabelecida é:

```text
Nunca enviar a senha atual ao usuário.
```

O mecanismo técnico ainda precisa ser definido.

## Fluxo desejado

```text
Usuário solicita recuperação
        ↓
Backend gera token temporário
        ↓
Token enviado por canal seguro
        ↓
Usuário define nova senha
        ↓
Token invalidado
```

---

# 20. OQ-016 — Relatórios Administrativos

**Status:** ABERTA

**Diagrama de navegação (2026-10-03):** o diagrama de navegação (`public/images/diagrama-navegacao.png`, `DEC-079`) prevê "Relatórios" no painel administrativo, sem detalhar quais.

## Questão

Quais relatórios serão obrigatórios no painel administrativo?

Possibilidades:

```text
coletas por período
coletas por status
coletas por cliente
coletas por coletor
quantidade por categoria
volume de resíduos
coletas concluídas
coletas pendentes
```

Ainda é necessário estabelecer:

```text
relatórios obrigatórios
filtros
períodos
gráficos
exportações
indicadores
```

---

# 21. OQ-017 — Exportação de Relatórios

**Status:** ABERTA

## Questão

O administrador poderá exportar relatórios?

Possibilidades:

```text
CSV
PDF
XLSX
nenhuma exportação no MVP
```

A necessidade de exportação deverá ser avaliada conforme o escopo acadêmico e operacional.

---

# 22. OQ-018 — Integrações com Parceiros

**Status:** ABERTA

## Questão

A EcoByte terá integração real com organizações externas responsáveis por:

```text
reciclagem
destinação
logística
ecopontos externos
```

No MVP atual, a EcoByte possui seu próprio ecoponto central e não depende de parceiros externos para concluir o fluxo principal.

Integrações externas devem ser consideradas somente caso façam parte do escopo futuro.

---

# 23. OQ-019 — Destinação Pós-Ecoponto

**Status:** ABERTA

## Questão

O sistema precisará representar o que acontece com os resíduos depois que eles chegam ao ecoponto central?

O fluxo atual termina em:

```text
ENTREGUE_ECOPONTO
    ↓
CONCLUIDA
```

Ainda não foi definido se haverá posteriormente uma etapa de:

```text
triagem
reutilização
reciclagem
destinação final
```

## Observação

Essa questão não deve ser implementada automaticamente apenas por ser conceitualmente relacionada ao descarte eletrônico.

É necessária uma decisão de escopo.

---

# 24. OQ-020 — Agendamento de Coletas

**Status:** ABERTA

**Diagrama de navegação (2026-10-03):** o diagrama de navegação (`public/images/diagrama-navegacao.png`, `DEC-079`) prevê a etapa "Escolher Data e Horário" na solicitação. O site informa que a escolha ainda não está disponível.

**Comportamento enquanto aberta (2026-09-26):** a criação de coleta não aceita `dataAgendada`; o campo permanece `null`.

## Questão

O cliente poderá escolher data e horário específicos para a coleta?

Possibilidades:

```text
coleta imediata
agendamento
ambos
```

Caso o agendamento seja adotado, será necessário definir:

```text
data
horário
janela de horário
conflitos
disponibilidade
cancelamento
reagendamento
```

---

# 25. OQ-021 — Cancelamento de Coleta

**Status:** ABERTA

## Questão

O cliente poderá cancelar uma coleta?

Caso a resposta seja positiva, deverá ser definido:

```text
até qual status
quem pode cancelar
motivo obrigatório ou opcional
como registrar o cancelamento
se haverá notificação
```

Também deverá ser definido se existirá um novo status ou uma marcação adicional.

Não criar um novo status automaticamente sem atualizar a máquina de estados em:

```text
14_STATE_MACHINE.md
```

---

# 26. OQ-022 — Reagendamento

**Status:** ABERTA

## Questão

Será possível reagendar uma coleta?

Caso seja permitido:

```text
quem pode reagendar
em quais estados
com quanto tempo de antecedência
```

deverá ser definido.

---

# 27. OQ-023 — Tempo Estimado de Chegada

**Status:** ABERTA

## Questão

O cliente deverá visualizar uma previsão de chegada do coletor?

Possibilidades:

```text
não mostrar estimativa
mostrar período aproximado
mostrar horário estimado
mostrar localização do coletor
```

A última opção exigiria decisões adicionais de privacidade, rastreamento e infraestrutura.

---

# 28. OQ-024 — Rastreamento do Coletor

**Status:** ABERTA

## Questão

O sistema terá rastreamento da localização do coletor durante a operação?

No MVP atual isso não está definido como requisito.

Caso seja futuramente incorporado, será necessário definir:

```text
frequência de atualização
precisão
permissões
armazenamento
visibilidade para cliente
retenção
privacidade
```

---

# 29. OQ-025 — Comprovante de Recolhimento

**Status:** ABERTA

## Questão

O sistema deverá gerar um comprovante após o recolhimento?

Possibilidades:

```text
simples registro no sistema
PDF
QR Code
assinatura digital
foto da coleta
```

Ainda não existe uma decisão formal.

---

# 30. OQ-026 — Evidência Fotográfica

**Status:** ABERTA

## Questão

O coletor deverá registrar fotos durante:

```text
recolhimento
entrega no ecoponto
```

Caso seja adotado, será necessário definir:

```text
armazenamento
limite de tamanho
formatos
privacidade
retenção
acesso
```

---

# 31. OQ-027 — Funcionamento Offline do Coletor

**Status:** ABERTA

## Questão

O painel do coletor deverá funcionar sem conexão temporária?

Possibilidades:

```text
somente online
offline parcial
PWA
sincronização posterior
```

Nenhuma dessas opções está atualmente definida como requisito do MVP.

---

# 32. OQ-028 — PWA

**Status:** ABERTA

## Questão

A aplicação deverá possuir características de Progressive Web App?

Possibilidades:

```text
instalação no dispositivo
cache
funcionamento parcial offline
push notifications
```

Essa decisão deve ser tomada de acordo com a necessidade real do projeto e não apenas como extensão tecnológica.

---

# 33. OQ-029 — Multi-Ecoponto Futuro

**Status:** ABERTA

## Questão

Em futuras versões, a EcoByte poderá possuir mais de um ecoponto?

O MVP atual permanece:

```text
1 ecoponto central
```

Caso seja expandido, deverão ser avaliados:

```text
seleção de ecoponto
roteirização
capacidade
distância
disponibilidade
status
administração
```

A existência futura de múltiplos ecopontos não altera a decisão atual do MVP.

---

# 34. OQ-030 — Roteirização do Coletor

**Status:** ABERTA

**Diagrama de navegação (2026-10-03):** o diagrama de navegação (`public/images/diagrama-navegacao.png`, `DEC-079`) prevê "Visualizar rotas do dia" no painel do coletor. Não implementado: depende desta questão (13 §45–§46).

## Questão

O painel do coletor deverá calcular automaticamente uma rota otimizada?

Possibilidades:

```text
ordenação manual
ordenação por proximidade
rota automática
integração com serviço de mapas
```

O fluxo do coletor atualmente prevê:

```text
rotas do dia
```

mas a estratégia concreta de geração dessas rotas ainda não foi definida.

---

# 35. OQ-031 — Serviço de Mapas

**Status:** ABERTA (parcialmente decidida)

**Decidido em `DEC-079` (2026-10-03):** "Como chegar" abre rotas no Google Maps em uma nova aba, por link externo, sem mapa embutido. Continuam em aberto: mapa na página, serviço definitivo e chaves de API.

## Questão

Qual tecnologia será utilizada para mapas e localização, caso sejam necessários?

Possibilidades incluem:

```text
Google Maps
OpenStreetMap
Mapbox
Leaflet
outra solução
```

A escolha deverá considerar:

```text
custo
licenciamento
API
limites
integração
necessidade acadêmica
```

---

# 36. OQ-032 — Identidade Visual Definitiva do Produto

**Status:** ABERTA (parcialmente decidida)

**Decidido em `DEC-071` (2026-09-26):** paleta derivada da logo oficial e tipografia Inter. Continuam em aberto as variações oficiais da logo, ícones customizados, ilustrações e fotografias.

## Questão

Quais elementos visuais da marca EcoByte serão considerados oficiais na implementação final?

Necessário definir:

```text
logo final
variações da logo
paleta final
tipografia
ícones
ilustrações
fotografias
```

O design system já estabelece uma direção visual, mas os assets finais ainda precisam ser consolidados.

---

# 37. OQ-033 — Assets Externos e Licenciamento

**Status:** ABERTA (parcialmente decidida)

**Decidido em `DEC-079` (2026-10-03):** o responsável pelo projeto confirmou a licença das fotografias Adobe Stock em `public/images/` (`AdobeStock_*`), que passam a ser usadas no site público em versões otimizadas (16 §81). Fontes e demais assets seguem esta questão.

## Questão

Quais fontes, imagens, vídeos, ícones ou ilustrações externas serão utilizados?

Para cada asset externo deverá ser possível determinar:

```text
origem
licença
restrições
atribuição necessária
arquivo original
```

Nenhum asset de terceiros deve ser incorporado sem verificar sua licença.

---

# 38. OQ-034 — Provedor de Hospedagem Definitivo

**Status:** ABERTA

## Questão

Qual infraestrutura será utilizada na publicação final da aplicação?

Possíveis componentes:

```text
frontend
backend
MongoDB
armazenamento de arquivos
e-mail
domínio
```

A escolha deve ser documentada antes do deployment final.

---

# 39. OQ-035 — Ambiente de Produção do MongoDB

**Status:** ABERTA

## Questão

Qual serviço será utilizado para o banco MongoDB em produção?

Devem ser avaliados:

```text
MongoDB Atlas
servidor próprio
infraestrutura acadêmica
outro serviço
```

Também será necessário definir:

```text
backup
retenção
monitoramento
usuários
permissões
rede
```

---

# 40. OQ-036 — Estratégia de Backup

**Status:** ABERTA

## Questão

Qual será a política de backup do ambiente de produção?

Definir:

```text
frequência
retenção
local de armazenamento
criptografia
restauração
testes de restore
```

O projeto não deve considerar backup existente simplesmente porque o banco está hospedado em um serviço gerenciado.

---

# 41. OQ-037 — Monitoramento

**Status:** ABERTA

## Questão

Quais mecanismos de monitoramento serão utilizados no ambiente publicado?

Possíveis necessidades:

```text
logs
erros
disponibilidade
tempo de resposta
uso do banco
erros de frontend
```

A solução ainda não foi definida.

---

# 42. OQ-038 — Rate Limiting

**Status:** DECIDIDA

**Decisão:** `DEC-067` (2026-09-25) — login 10 a cada 15 min e cadastro 5 por hora, por IP. Identificação do IP: `DEC-068`. Limites de recuperação de senha serão definidos com esse fluxo.

## Questão

Quais endpoints deverão possuir limites específicos de requisições?

A documentação de segurança prevê rate limiting como consideração, mas os limites concretos ainda não foram definidos.

Possíveis áreas prioritárias:

```text
login
cadastro
recuperação de senha
endpoints públicos
operações sensíveis
```

---

# 43. OQ-039 — Política de Retenção de Dados

**Status:** ABERTA

## Questão

Por quanto tempo determinadas informações deverão ser mantidas?

Possíveis dados:

```text
usuários inativos
notificações
coletas concluídas
logs
tokens expirados
evidências
```

A política definitiva ainda não foi estabelecida.

---

# 44. OQ-040 — Exclusão de Conta

**Status:** ABERTA

## Questão

O usuário poderá solicitar exclusão da própria conta?

Caso seja permitido, deverá ser definido se ocorrerá:

```text
exclusão física
desativação
anonimização
retenção parcial por histórico
```

Essa questão deve considerar o fato de que coletas possuem histórico operacional.

---

# 45. OQ-041 — Alteração de Dados Cadastrais

**Status:** ABERTA (parcialmente decidida)

**Decidido em `DEC-078` (2026-10-01):** o usuário altera nome, telefone e, se for PJ, razão social e nome fantasia. A senha é trocada informando a senha atual. E-mail, documentos e endereço não são alterados pelo perfil. Continuam em aberto: troca de e-mail, confirmações adicionais e registro das alterações (`OQ-056`).

## Questão

Quais dados o usuário poderá alterar diretamente?

Exemplos:

```text
nome
telefone
endereço
documentos
dados da empresa
senha
e-mail
```

Também deverá ser definido quais alterações:

```text
exigem confirmação
exigem autenticação adicional
ficam registradas
```

---

# 46. OQ-042 — Dados Específicos de Pessoa Jurídica

**Status:** DECIDIDA

**Decisão:** `DEC-066` (2026-09-25) — razão social obrigatória, nome fantasia opcional; CNPJ não coletado enquanto `OQ-044` estiver aberta.

## Questão

Quais campos serão obrigatórios para o cadastro PJ?

Possíveis campos:

```text
razão social
nome fantasia
CNPJ
responsável
telefone
endereço
```

O modelo atual diferencia:

```text
tipoCadastro = PJ
```

mas os campos empresariais definitivos ainda precisam ser consolidados.

---

# 47. OQ-043 — Dados Específicos de Pessoa Física

**Status:** DECIDIDA

**Decisão:** `DEC-066` (2026-09-25) — nome, e-mail, senha, confirmação e tipoCadastro obrigatórios; telefone opcional; CPF não coletado enquanto `OQ-044` estiver aberta.

## Questão

Quais informações serão obrigatórias no cadastro PF?

Possíveis campos:

```text
nome
CPF
telefone
endereço
```

A lista definitiva ainda não foi estabelecida neste documento.

---

# 48. OQ-044 — Documentos de Identificação

**Status:** ABERTA

**Comportamento enquanto aberta (`DEC-066`, 2026-09-25):** CPF e CNPJ não são coletados no cadastro.

## Questão

O sistema deverá armazenar:

```text
CPF
CNPJ
```

e, caso sim:

```text
quando validar
como validar
como armazenar
se haverá criptografia específica
```

Essa questão deve ser definida antes da implementação definitiva dos campos correspondentes.

---

# 49. OQ-045 — Regras de Telefone

**Status:** ABERTA (parcialmente decidida)

**Decidido em `DEC-066` (2026-09-25):** telefone opcional no cadastro. Formato, DDI/DDD, WhatsApp e múltiplos telefones continuam em aberto.

## Questão

O telefone será:

```text
obrigatório
opcional
obrigatório somente em determinados cadastros
```

Também é necessário definir:

```text
formato
DDI
DDD
WhatsApp
mais de um telefone
```

---

# 50. OQ-046 — Canal Principal de Contato

**Status:** ABERTA

## Questão

Qual será o canal oficial de comunicação entre EcoByte e usuário?

Possibilidades:

```text
notificação interna
e-mail
WhatsApp
SMS
combinação de canais
```

Nenhuma opção deve ser tratada como definitiva sem decisão formal.

---

# 51. OQ-047 — Regras de Visibilidade das Coletas

**Status:** ABERTA (parcialmente decidida)

**Decidido em `DEC-070` (2026-09-26):** o coletor consulta coletas `PENDENTE` e as atribuídas a ele; coletas de outro coletor respondem 404. Continuam em aberto os agrupamentos da interface e o tempo de visibilidade das concluídas.

**Interface enquanto aberta (2026-09-28, `DEC-074`):** "Minhas coletas" lista todas as atribuídas, em qualquer status, sem agrupamentos, e as concluídas continuam visíveis. O painel mostra o total de atribuídas, mas não o total "em andamento" (13 §43) nem uma "próxima coleta": para isso, é preciso definir os agrupamentos e o critério de prioridade (13 §84) e incluir na API um filtro por status.

## Questão

Quais coletas um coletor poderá visualizar?

No modelo atual, existem:

```text
coletas disponíveis
coletas atribuídas
coletas concluídas
```

Ainda é necessário definir exatamente:

```text
quais status aparecem em cada tela
por quanto tempo permanecem visíveis
quais filtros existem
```

---

# 52. OQ-048 — Coletas Simultâneas por Coletor

**Status:** ABERTA

## Questão

Um coletor poderá possuir várias coletas atribuídas ao mesmo tempo?

Possibilidades:

```text
uma por vez
várias
limite configurável
```

A resposta influencia a lógica de:

```text
rotas
aceitação
disponibilidade
conclusão
painel
```

---

# 53. OQ-049 — Capacidade Operacional do Coletor

**Status:** ABERTA

## Questão

Existirá algum limite de capacidade para o coletor?

Exemplos:

```text
quantidade de itens
peso
volume
quantidade de coletas
```

Essa decisão depende também do modelo físico da operação.

---

# 54. OQ-050 — Regras de Falha no Recolhimento

**Status:** ABERTA

## Questão

O que ocorre caso o coletor chegue ao endereço e não consiga realizar o recolhimento?

Exemplos de situação:

```text
cliente ausente
endereço incorreto
resíduos incompatíveis
quantidade diferente da informada
problema operacional
```

Ainda não foi definido:

```text
status
motivo
notificação
reagendamento
cancelamento
```

---

# 55. OQ-051 — Divergência entre Solicitação e Resíduos Encontrados

**Status:** ABERTA

## Questão

O coletor poderá alterar os itens registrados quando encontrar resíduos diferentes do informado pelo cliente?

Por exemplo:

```text
Cliente informa:
2 computadores

Coletor encontra:
2 computadores + 5 cabos
```

Ainda é necessário definir:

```text
permitido
não permitido
exige confirmação
gera ajuste
```

---

# 56. OQ-052 — Confirmação do Cliente

**Status:** ABERTA

## Questão

O cliente deverá confirmar que o recolhimento ocorreu?

Possibilidades:

```text
não
simples confirmação
código
assinatura
QR Code
```

O fluxo atual considera a confirmação operacional pelo coletor, mas não define uma confirmação independente pelo cliente.

---

# 57. OQ-053 — Cancelamento pelo Coletor

**Status:** ABERTA

## Questão

O coletor poderá recusar ou cancelar uma coleta após aceitá-la?

Caso sim, será necessário definir:

```text
motivos válidos
efeito no status
retorno para PENDENTE
reatribuição
registro histórico
```

Não assumir automaticamente que:

```text
ACEITA → PENDENTE
```

é uma transição válida.

---

# 58. OQ-054 — Administração de Usuários

**Status:** ABERTA (parcialmente decidida)

**Decidido em `DEC-075` (2026-09-29):** o administrador visualiza, desativa e reativa clientes e coletores. Contas `ADMIN` não têm o status alterado, e um coletor com coletas em andamento não pode ser desativado. Continuam em aberto: editar dados, alterar `role` e consultar histórico.

## Questão

Quais ações o administrador poderá realizar sobre usuários?

Possibilidades:

```text
visualizar
editar
desativar
reativar
alterar role
consultar histórico
```

Alterações de `role` devem ser tratadas com cuidado devido ao impacto direto nas permissões.

---

# 59. OQ-055 — Administração de Coletas

**Status:** ABERTA

**Comportamento enquanto aberta (2026-09-29, `DEC-075`):** a administração de coletas é somente leitura. O administrador não altera status nem coletor responsável. Por isso, a desativação de um coletor com coletas em andamento é recusada.

## Questão

O administrador poderá alterar manualmente o estado ou responsável de uma coleta?

Caso sim, devem ser definidas operações administrativas específicas.

Não assumir que o administrador poderá ignorar automaticamente a máquina de estados.

---

# 60. OQ-056 — Auditoria Administrativa

**Status:** ABERTA

## Questão

A aplicação deverá registrar alterações administrativas sensíveis?

Exemplos:

```text
alteração de role
desativação de usuário
alteração de coleta
alteração de ecoponto
```

Ainda não foi definido se haverá uma coleção própria de auditoria.

---

# 61. OQ-057 — Logs de Auditoria

**Status:** ABERTA

## Questão

Quais eventos precisam ser registrados para auditoria?

Possíveis eventos:

```text
login
falha de login
alteração de senha
alteração de role
criação de coleta
mudança de status
desativação
ações administrativas
```

A estratégia de retenção e armazenamento também precisa ser definida.

---

# 62. OQ-058 — Soft Delete Abrangente

**Status:** ABERTA

## Questão

Quais entidades utilizarão exclusivamente desativação lógica?

A decisão atual prevê preferência por:

```text
ATIVO / INATIVO
```

quando o histórico precisar ser preservado.

Ainda é necessário definir exatamente quais recursos seguirão esse padrão.

---

# 63. OQ-059 — Estado de Usuário

**Status:** ABERTA

## Questão

Quais estados um usuário poderá possuir?

Atualmente existe:

```text
ATIVO
INATIVO
```

Ainda não foi definido se haverá estados adicionais como:

```text
PENDENTE
BLOQUEADO
SUSPENSO
```

Nenhum desses estados adicionais deve ser implementado sem decisão.

---

# 64. OQ-060 — Sessões Simultâneas

**Status:** ABERTA

## Questão

Um usuário poderá manter várias sessões/dispositivos ativos simultaneamente?

Possibilidades:

```text
permitido
limitado
uma sessão por vez
```

Também deverá ser definido se o sistema terá:

```text
encerrar todas as sessões
listar sessões
revogar dispositivo
```

---

# 65. OQ-061 — Autenticação em Dois Fatores

**Status:** ABERTA

## Questão

Será necessário utilizar autenticação multifator?

Essa funcionalidade não faz parte do MVP atualmente definido.

Caso futuramente adotada, deverá ser especificada separadamente.

---

# 66. OQ-062 — Política de Expiração de Sessão

**Status:** DECIDIDA

**Decisão:** `DEC-021` (2026-09-25) — 7 dias sem uso, renovada a cada requisição autenticada. O texto abaixo é mantido como registro histórico.

## Questão

Quanto tempo uma sessão autenticada permanecerá válida?

Necessário definir:

```text
expiração
renovação
logout
inatividade
```

A política definitiva dependerá do mecanismo de autenticação escolhido.

---

# 67. OQ-063 — Política de Troca de Senha

**Status:** ABERTA (parcialmente decidida)

**Decidido em `DEC-078` (2026-10-01):** o usuário troca a própria senha no perfil. A troca exige a senha atual, a nova senha com confirmação e a mesma política do cadastro (`DEC-019`), e a nova senha deve ser diferente da atual. A sessão atual continua, com novo identificador. Continua em aberto invalidar as demais sessões do usuário (`OQ-060`).

## Questão

O usuário poderá alterar a própria senha dentro do painel?

Caso sim:

```text
senha atual
nova senha
confirmação
regras de complexidade
invalidação de sessões
```

deverão ser definidos.

---

# 68. OQ-064 — Limites de Upload

**Status:** ABERTA

## Questão

Caso o sistema utilize arquivos ou imagens, quais limites serão adotados?

Definir:

```text
formatos
tamanho máximo
quantidade máxima
dimensões
armazenamento
```

Até que o upload seja formalmente incorporado ao escopo, nenhuma regra definitiva deve ser implementada.

---

# 69. OQ-065 — Estratégia de Armazenamento de Arquivos

**Status:** ABERTA

## Questão

Caso sejam adicionados:

```text
fotos
comprovantes
documentos
arquivos
```

onde esses dados serão armazenados?

Possibilidades:

```text
storage local
object storage
serviço especializado
```

Essa decisão permanece dependente da definição de funcionalidades que utilizem arquivos.

---

# 70. OQ-066 — Escopo Acadêmico Final

**Status:** ABERTA

## Questão

Quais funcionalidades serão efetivamente apresentadas como parte da entrega final da disciplina?

A decisão deve considerar:

```text
Desenvolvimento Web III
Banco de Dados Não Relacional
requisitos do Projeto Integrador
```

O escopo final deve ser consolidado antes da fase de entrega.

---

# 71. OQ-067 — Requisitos Acadêmicos Adicionais

**Status:** ABERTA

## Questão

Os professores poderão estabelecer requisitos adicionais durante o desenvolvimento?

Caso novos requisitos sejam introduzidos, eles deverão ser:

```text
registrados
avaliados
incorporados aos documentos
testados
```

Não alterar o domínio apenas com base em uma necessidade implícita.

---

# 71.1 OQ-069 — Endereço no Cadastro do Usuário

**Status:** ABERTA

## Questão

O usuário deverá possuir um endereço cadastrado no perfil?

O `DEC-008` menciona que "o cliente pode alterar seu endereço cadastrado", mas o schema de `users` (`07_DATABASE_MONGODB.md`) não possui campo de endereço.

Possibilidades:

```text
A) Sem endereço no perfil; o endereço é informado a cada coleta
B) Endereço no perfil, copiado como sugestão para a coleta
C) Vários endereços salvos no perfil
```

Independentemente da decisão, o endereço da coleta continua sendo um snapshot embutido (`DEC-008`).

Enquanto a questão estiver aberta, a implementação segue o schema atual: sem endereço no perfil.

## Impactos

```text
users
perfil
formulário de solicitação
API /profile
seed
```

---

# 72. OQ-068 — Critério para Encerramento das Questões

**Status:** ABERTA

## Questão

Quando uma questão poderá ser considerada definitivamente resolvida?

Critério recomendado:

```text
problema identificado
↓
alternativas avaliadas
↓
decisão tomada
↓
DECISIONS.md atualizado
↓
documentação relacionada atualizada
↓
implementação atualizada
↓
testes atualizados
```

Uma questão não deve ser considerada resolvida apenas porque alguém implementou uma solução provisória.

---

# 73. OQ-069 — Conteúdo Institucional Definitivo

**Status:** ABERTA

**Comportamento enquanto aberta (2026-10-03, `DEC-079`):** as páginas Sobre o Projeto e Como Funciona usam textos provisórios, escritos a partir de `00_PROJECT_OVERVIEW.md` e das regras já definidas. A seção Equipe informa que os integrantes serão publicados, e Impacto Ambiental não apresenta números.

## Questão

Quais serão os textos definitivos do site institucional?

Ainda é necessário definir:

```text
integrantes da equipe (nomes, papéis, fotos)
missão e textos institucionais aprovados
indicadores de impacto e sua fonte
perguntas frequentes definitivas
```

Nenhum nome, número ou indicador deve ser inventado.

---

# 74. OQ-070 — Número de Protocolo da Solicitação

**Status:** ABERTA

## Questão

A solicitação de coleta terá um número de protocolo, como mostra o diagrama de navegação (`public/images/diagrama-navegacao.png`, `DEC-079`)?

Hoje a coleta é identificada pelo `id` do MongoDB.

Ainda é necessário definir:

```text
formato do protocolo
geração (sequencial, por data, aleatório)
onde é exibido e se é usado em buscas
```

---

# 75. OQ-071 — Endereço no Cadastro

**Status:** ABERTA

## Questão

O cadastro deve pedir endereço, como mostra o diagrama de navegação (`public/images/diagrama-navegacao.png`, `DEC-079`) ("Dados pessoais e endereço")?

Hoje o cadastro não pede endereço (`DEC-066`): ele é informado em cada solicitação e guardado na coleta como retrato histórico (`DEC-008`).

Caso o endereço passe a fazer parte do cadastro, será necessário definir se ele é obrigatório e se preenche automaticamente a solicitação.

---

# 76. Processo de Resolução

Para cada questão:

```text
1. Identificar o problema
2. Verificar documentos existentes
3. Verificar impacto no domínio
4. Avaliar alternativas
5. Tomar decisão
6. Registrar em DECISIONS.md
7. Atualizar documentos relacionados
8. Implementar
9. Testar
```

---

# 77. Matriz de Impacto

As questões devem ser tratadas conforme o impacto.

| Impacto | Exemplos | Tratamento |
|---|---|---|
| Baixo | texto de interface, detalhe visual | pode ser resolvido durante implementação |
| Médio | filtro, componente, formato de resposta | registrar quando afetar outros documentos |
| Alto | autenticação, banco, máquina de estados | exigir decisão formal |
| Crítico | segurança, dados reais, autorização, produção | decisão explícita antes da implementação |

---

# 78. Questões que Não Devem ser Inventadas pela IA

Enquanto permanecerem abertas, agentes de IA não devem assumir automaticamente decisões sobre:

```text
autenticação definitiva
verificação de e-mail
endereço real do ecoponto
coordenadas reais
horários operacionais
categorias oficiais
limites de coleta
integrações externas
política de retenção
requisitos acadêmicos não documentados
```

Quando uma dessas informações for necessária para uma implementação, a IA deve:

```text
consultar os documentos
verificar se existe decisão vigente
usar apenas comportamento já estabelecido
ou sinalizar a questão como bloqueadora
```

---

# 79. Questões Bloqueadoras

Uma questão deve ser marcada como `BLOQUEADA` quando a implementação não puder ser concluída corretamente sem sua resolução.

Exemplos:

```text
mecanismo definitivo de autenticação
```

antes de implementar a infraestrutura final de login.

Ou:

```text
categoria definitiva de resíduos
```

antes de congelar o enum utilizado pela API e banco.

---

# 80. Ao Resolver uma Questão

Quando uma questão for resolvida:

### Antes

```text
OPEN_QUESTIONS.md
OQ-XXX
Status: ABERTA
```

### Depois

```text
OPEN_QUESTIONS.md
OQ-XXX
Status: DECIDIDA
```

E a decisão completa deverá ser registrada em:

```text
DECISIONS.md
```

Exemplo:

```text
OQ-002
    ↓
DEC-XXX
```

---

# 81. Registro Atual

No momento, as questões consideradas especialmente importantes para a próxima etapa são:

```text
OQ-001
Verificação de e-mail

OQ-003
Endereço definitivo do ecoponto

OQ-004
Coordenadas definitivas

OQ-005
Horário do ecoponto

OQ-006
Horários de coleta

OQ-007
Categorias definitivas de resíduos

OQ-008
Quantidade máxima de resíduos

OQ-011
Uso de geolocalização

OQ-014
Provedor de e-mail

OQ-016
Relatórios administrativos

OQ-018
Integrações com parceiros
```

Essas questões não devem ser tratadas como decisões já tomadas.

---

# 82. Relação com `DECISIONS.md`

Quando uma questão for resolvida, ela deve deixar de ser uma hipótese e passar a representar uma decisão formal do projeto.

Fluxo:

```text
OPEN_QUESTIONS.md
        ↓
decisão
        ↓
DECISIONS.md
        ↓
documentação afetada
        ↓
código
        ↓
testes
```

---

# 83. Regra Final

Este documento representa aquilo que **ainda não foi definido**.

Portanto:

```text
OPEN_QUESTIONS.md
= incertezas controladas
```

e não:

```text
OPEN_QUESTIONS.md
= requisitos implícitos
```

Enquanto uma questão permanecer aberta, ela deve continuar sendo tratada como aberta.

Quando houver uma decisão:

```text
questão
→ decisão formal
→ documentação
→ implementação
→ teste
```

Essa disciplina evita que o projeto adquira comportamentos não planejados e mantém o EcoByte consistente à medida que novas decisões forem tomadas.