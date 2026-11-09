# Relatório de Avaliação Heurística — EcoByte

**Disciplina:** Interação Humano-Computador
**Etapa:** 1. Diagnóstico do sistema existente
**Sistema avaliado:** EcoByte, a versão publicada em https://eco-byte-neon.vercel.app (commit `a0c25c2`, 06/11/2026)
**Método:** avaliação heurística com as 10 heurísticas de usabilidade de Jakob Nielsen

---

## 1. Objetivo

Identificar problemas de usabilidade da versão atual do EcoByte (a "versão legada" do ciclo anterior), classificá-los por gravidade e apontar recomendações. O resultado orienta o redesign centrado no usuário e a validação empírica da nova versão.

## 2. Método

### 2.1 Heurísticas de Nielsen

| Código | Heurística |
|---|---|
| H1 | Visibilidade do status do sistema |
| H2 | Correspondência entre o sistema e o mundo real |
| H3 | Controle e liberdade do usuário |
| H4 | Consistência e padrões |
| H5 | Prevenção de erros |
| H6 | Reconhecer em vez de lembrar |
| H7 | Flexibilidade e eficiência de uso |
| H8 | Estética e design minimalista |
| H9 | Ajudar os usuários a reconhecer, diagnosticar e se recuperar de erros |
| H10 | Ajuda e documentação |

### 2.2 Escala de severidade (Nielsen)

| Grau | Significado | Prioridade |
|---|---|---|
| 0 | Não é um problema de usabilidade | — |
| 1 | Problema cosmético | Corrigir se houver tempo |
| 2 | Problema pequeno | Baixa prioridade |
| 3 | Problema grande | Alta prioridade |
| 4 | Catástrofe de usabilidade | Corrigir antes de lançar |

A severidade combina três fatores:
- **frequência:** com que frequência o problema acontece;
- **impacto:** se o usuário consegue contornar e a que custo;
- **persistência:** se o problema volta a incomodar mesmo depois de conhecido.

### 2.3 Procedimento

- **Perfis e tarefas percorridos:**
  - **Visitante:** entender o serviço na página inicial, criar conta, recuperar senha e acessar um endereço inexistente;
  - **Cliente:** solicitar uma coleta (endereço pelo CEP, itens, revisão) e acompanhar uma coleta pendente;
  - **Coletor:** consultar as coletas em andamento, abrir uma coleta e avançar a etapa;
  - **Administrador:** editar o ecoponto, consultar relatórios e lidar com a sessão expirada.
- **Dispositivos:** celular, com tela de 390 px de largura (o projeto é *mobile-first*), e computador, com 1280 px.
- **Ambiente:**
  - páginas públicas avaliadas no **sistema publicado**;
  - telas logadas avaliadas no **mesmo código, rodando localmente**, com as contas de demonstração (a interface é idêntica; só os dados são fictícios), para não usar contas reais de produção.
- **Evidência:** cada problema foi confirmado na tela, com captura em [`ihc/evidencias/`](ihc/evidencias/), ou reproduzido de propósito, como a sessão expirada. Em alguns casos, a causa também foi conferida no código.

### 2.4 Limitações

- **Avaliador único.** Esta avaliação foi feita por **um avaliador**, um assistente de IA, como apoio ao grupo. Nielsen recomenda de 3 a 5 avaliadores independentes, porque cada um encontra uma parte diferente dos problemas. O grupo deve fazer as próprias avaliações e **consolidar** os resultados, unificando problemas repetidos e discutindo as severidades.
- **Inspeção, não teste com usuários.** A avaliação heurística aponta problemas prováveis. A confirmação com usuários reais é a etapa de validação empírica da disciplina.

---

## 3. Resumo dos resultados

**12 problemas encontrados:** nenhum catastrófico (4), **3 grandes (3)**, 6 pequenos (2) e 3 cosméticos (1).

| # | Problema | Heurística | Severidade |
|---|---|---|---|
| P01 | Ações do coletor são irreversíveis e executadas com um toque, sem confirmação | H5 (H3) | **3** |
| P02 | O cliente não consegue cancelar nem corrigir uma solicitação | H3 | **3** |
| P03 | A coleta pode ser solicitada sem nenhum telefone de contato | H5 (H2) | **3** |
| P04 | Categoria e condição dos itens são digitadas livremente | H6 (H4) | 2 |
| P05 | Ações principais da página inicial somem enquanto a API responde | H1 | 2 |
| P06 | Página "não encontrada" em inglês, sem marca e sem caminho de volta | H9 (H2, H4) | 2 |
| P07 | Sessão do administrador expira sem aviso e com mensagem vaga | H1 (H9) | 2 |
| P08 | Telefone do cliente não pode ser tocado para ligar | H7 | 2 |
| P09 | O endereço precisa ser digitado em toda nova solicitação | H7 | 2 |
| P10 | Nomes de categorias aparecem sem acento ("Informatica") | H4 (H2) | 1 |
| P11 | Plural errado nos relatórios ("1 solicitadas") | H2 | 1 |
| P12 | Áreas logadas sem acesso a ajuda | H10 | 1 |

### Distribuição por heurística

| Heurística | Problemas |
|---|---|
| H1 Visibilidade do status | 2 |
| H2 Mundo real | 1 |
| H3 Controle e liberdade | 1 |
| H4 Consistência e padrões | 1 |
| H5 Prevenção de erros | 2 |
| H6 Reconhecer em vez de lembrar | 1 |
| H7 Flexibilidade e eficiência | 2 |
| H8 Design minimalista | 0 |
| H9 Recuperação de erros | 1 |
| H10 Ajuda e documentação | 1 |

A heurística principal de cada problema é a da tabela; as entre parênteses também são afetadas.

---

## 4. Problemas encontrados

### P01 — Ações do coletor são irreversíveis e executadas com um toque

| | |
|---|---|
| **Heurística** | H5 Prevenção de erros (também H3) |
| **Severidade** | **3, grande** |
| **Onde** | Detalhe da coleta, no perfil Coletor |

**Descrição.** As etapas da coleta (Aceitar, Iniciar rota, Confirmar recolhimento, Confirmar entrega e **Concluir coleta**) avançam com **um único toque**, sem confirmação, e não podem ser desfeitas: a máquina de estados só anda para frente. O botão fica no topo da tela, com 48 px de altura, ao alcance de um toque acidental ao rolar a página no celular.

**Evidência:** [`09-coletor-acao-concluir.jpeg`](ihc/evidencias/09-coletor-acao-concluir.jpeg). O código confirma que o botão chama a ação direto, sem diálogo (`collection-actions.tsx`).

**Impacto.** Um toque acidental registra, por exemplo, que o material foi entregue no ecoponto sem ter sido. Isso gera notificação falsa ao cliente e um histórico incorreto, e o coletor não consegue corrigir.

**Recomendação.** Pedir confirmação nas etapas irreversíveis, com o resumo do que será registrado ("Confirmar entrega de 7 itens no Ecoponto EcoByte?"). Outra opção é permitir "desfazer" por alguns segundos depois da ação.

### P02 — O cliente não consegue cancelar nem corrigir uma solicitação

| | |
|---|---|
| **Heurística** | H3 Controle e liberdade do usuário |
| **Severidade** | **3, grande** |
| **Onde** | Detalhe da coleta, no perfil Cliente |

**Descrição.** Depois de confirmar a solicitação, o cliente não tem nenhuma ação sobre ela. Na coleta pendente, o único elemento clicável é o link "Minhas coletas". Não há como cancelar quem desistiu, nem corrigir um endereço ou um item digitado errado.

**Evidência:** [`05-cliente-detalhe-pendente.jpeg`](ihc/evidencias/05-cliente-detalhe-pendente.jpeg). A faixa de navegação no meio da imagem é efeito da captura de página inteira, não da tela real.

**Impacto.** O usuário fica sem "saída de emergência". Um erro de digitação leva o coletor ao endereço errado, e quem desistiu continua com uma coleta pendente que um coletor pode aceitar.

**Recomendação.** Permitir cancelar a solicitação enquanto estiver **Pendente**, com confirmação, e editar endereço e itens até o aceite. **Depende de decisão de negócio** ainda em aberto (`OQ-021`, cancelamento de coleta).

### P03 — A coleta pode ser solicitada sem nenhum telefone de contato

| | |
|---|---|
| **Heurística** | H5 Prevenção de erros (também H2) |
| **Severidade** | **3, grande** |
| **Onde** | Cadastro e solicitação de coleta (Cliente); detalhe da coleta (Coletor) |

**Descrição.** O telefone é **opcional** no cadastro, e a solicitação de coleta não pede nenhum contato. Para esses clientes, o coletor vê "Telefone: Não informado" e não tem como avisar que está a caminho ou combinar o horário.

**Evidência:** [`09-coletor-acao-concluir.jpeg`](ihc/evidencias/09-coletor-acao-concluir.jpeg), seção "Cliente".

**Impacto.** No mundo real, a coleta depende de alguém estar no endereço. Sem contato, a ida pode ser perdida. O sistema não previne a situação, mesmo sabendo, no momento da solicitação, que o cliente não tem telefone.

**Recomendação.** Na solicitação, quando o perfil não tiver telefone, pedir um telefone de contato para aquela coleta, com a explicação "para o coletor avisar quando estiver a caminho". **Depende de decisão** sobre a obrigatoriedade do telefone (`OQ-045`).

### P04 — Categoria e condição dos itens são digitadas livremente

| | |
|---|---|
| **Heurística** | H6 Reconhecer em vez de lembrar (também H4) |
| **Severidade** | 2, pequeno |
| **Onde** | Solicitar coleta, etapa 2 "Itens" (Cliente) |

**Descrição.** "Categoria" e "Condição" são campos de texto, com sugestões que só aparecem enquanto se digita. O cliente precisa **lembrar** e escrever um nome de categoria, em vez de escolher de uma lista visível. Variações de escrita viram categorias diferentes: as sugestões gravam "INFORMATICA", e quem digita "informática" com acento grava "INFORMÁTICA". Os relatórios passam a contar duas categorias para o mesmo tipo de material.

**Evidência:** [`07-solicitar-etapa-itens.jpeg`](ihc/evidencias/07-solicitar-etapa-itens.jpeg). O comportamento foi reproduzido no formulário.

**Impacto.** Gera dúvida no preenchimento ("o que eu escrevo aqui?") e reduz a qualidade dos dados usados pela administração.

**Recomendação.** Usar uma lista de opções visíveis (botões ou um seletor), com a opção "Outro" para casos fora da lista. **Depende da lista oficial** de categorias e condições (`OQ-007`, `OQ-010`).

### P05 — Ações principais da página inicial somem enquanto a API responde

| | |
|---|---|
| **Heurística** | H1 Visibilidade do status do sistema |
| **Severidade** | 2, pequeno (condicional) |
| **Onde** | Página inicial (Visitante) |

**Descrição.** Os botões "Criar conta e solicitar" e "Já tenho conta" só aparecem **depois** que o site confirma, na API, se há alguém conectado. Até lá, o topo da página mostra apenas "Como funciona", sem nenhum sinal de carregamento. Com a API ativa, a espera medida foi de **0,19 s**, imperceptível. No plano gratuito de hospedagem, porém, a API "dorme" após 15 minutos sem uso e leva **cerca de 1 minuto** para responder.

**Evidência:** [`01-home-celular.jpeg`](ihc/evidencias/01-home-celular.jpeg), com a tela capturada antes da resposta da API, comparada com [`03-home-desktop.jpeg`](ihc/evidencias/03-home-desktop.jpeg), depois dela.

**Impacto.** O primeiro visitante depois de um período sem acesso, como numa apresentação ou num link compartilhado, não encontra a ação principal do site e pode desistir. No celular, o próximo botão "Solicitar Coleta" visível fica cerca de 7 telas abaixo.

**Recomendação.** Mostrar sempre a ação principal ("Solicitar coleta") e ajustar só o destino depois da resposta da API. Outra opção é exibir um espaço reservado com indicação de carregamento, em vez de esconder os botões.

### P06 — Página "não encontrada" em inglês, sem marca e sem caminho de volta

| | |
|---|---|
| **Heurística** | H9 Recuperação de erros (também H2 e H4) |
| **Severidade** | 2, pequeno |
| **Onde** | Qualquer endereço inexistente |

**Descrição.** Um link quebrado ou um endereço digitado errado mostra a página padrão do framework: "404 — This page could not be found.", **em inglês**, sem o logotipo, sem o visual do EcoByte e sem nenhum link.

**Evidência:** [`02-pagina-inexistente.jpeg`](ihc/evidencias/02-pagina-inexistente.jpeg).

**Impacto.** É um beco sem saída: o usuário não entende o que houve, a página parece de outro sistema, e só o botão "voltar" do navegador resolve.

**Recomendação.** Criar uma página própria, em português e com a identidade visual: "Página não encontrada", com links para a página inicial e, se o usuário estiver conectado, para o painel dele.

### P07 — Sessão do administrador expira sem aviso e com mensagem vaga

| | |
|---|---|
| **Heurística** | H1 Visibilidade do status do sistema (também H9) |
| **Severidade** | 2, pequeno |
| **Onde** | Área do administrador (ex.: edição do ecoponto) |

**Descrição.** Por segurança, a sessão do administrador termina após 30 minutos sem uso, sem nenhum aviso prévio. Ao tentar salvar depois disso, a tela mostra apenas **"Autenticação necessária."**:
- não explica que a sessão expirou;
- não oferece um botão para entrar de novo;
- o administrador continua na mesma página.

Ponto positivo: o texto digitado permanece no formulário.

**Evidência:** [`10-admin-sessao-expirada.jpeg`](ihc/evidencias/10-admin-sessao-expirada.jpeg), com a expiração reproduzida de propósito.

**Impacto.** O administrador não sabe o que fazer. Se recarregar a página para "tentar de novo", vai para o login e perde o que digitou.

**Recomendação.** Avisar alguns minutos antes da expiração ("Sua sessão vai expirar em 2 minutos. Continuar conectado?"). Quando expirar, explicar ("Sua sessão expirou por inatividade") e oferecer "Entrar novamente", voltando à mesma página.

### P08 — Telefone do cliente não pode ser tocado para ligar

| | |
|---|---|
| **Heurística** | H7 Flexibilidade e eficiência de uso |
| **Severidade** | 2, pequeno |
| **Onde** | Detalhe da coleta, no perfil Coletor |

**Descrição.** Quando o cliente informou telefone, o número aparece como **texto comum**, e não como link de chamada. O coletor, que usa o sistema no celular e na rua, precisa copiar ou memorizar o número para ligar.

**Evidência:** conferido no código da tela (`collector-collection-detail.tsx`, linha 185: o telefone é exibido como texto). Nos dados de demonstração, nenhum cliente tem telefone; ver também o P03.

**Impacto.** Etapas extras numa ação frequente do coletor, com risco de discar errado.

**Recomendação.** Exibir o telefone como link `tel:` ("Ligar para o cliente"), com alvo de toque de pelo menos 44 px.

### P09 — O endereço precisa ser digitado em toda nova solicitação

| | |
|---|---|
| **Heurística** | H7 Flexibilidade e eficiência de uso |
| **Severidade** | 2, pequeno |
| **Onde** | Solicitar coleta, etapa 1 "Endereço" (Cliente) |

**Descrição.** O perfil não guarda endereço, e o formulário não sugere os endereços já usados. A cada solicitação, o cliente informa tudo de novo. O CEP preenche rua e bairro, mas número e complemento são redigitados.

**Evidência:** [`06-solicitar-etapa-endereco.jpeg`](ihc/evidencias/06-solicitar-etapa-endereco.jpeg).

**Impacto.** Atrapalha principalmente empresas e instituições, que solicitam coletas com frequência, quase sempre no mesmo endereço.

**Recomendação.** Oferecer "Usar um endereço anterior", com os endereços das últimas coletas. **Depende de decisão** sobre endereço no cadastro (`OQ-071`).

### P10 — Nomes de categorias aparecem sem acento

| | |
|---|---|
| **Heurística** | H4 Consistência e padrões (também H2) |
| **Severidade** | 1, cosmético |
| **Onde** | Detalhe da coleta e relatórios (todos os perfis) |

**Descrição.** As categorias aparecem como "Informatica", "Eletronicos" e "Perifericos", porque o sistema exibe o código interno em vez do nome amigável. A própria lista de sugestões do formulário mostra "Informática" e "Eletrônicos", com acento: a mesma categoria aparece escrita de dois jeitos.

**Evidência:** [`05-cliente-detalhe-pendente.jpeg`](ihc/evidencias/05-cliente-detalhe-pendente.jpeg), seção "Itens".

**Recomendação.** Exibir sempre o nome amigável da categoria, o mesmo da lista de sugestões.

### P11 — Plural errado nos relatórios

| | |
|---|---|
| **Heurística** | H2 Correspondência com o mundo real |
| **Severidade** | 1, cosmético |
| **Onde** | Relatórios, "Coletas por mês" (Administrador) |

**Descrição.** O gráfico mensal escreve "**1 solicitadas**" e "**1 concluídas**". Os demais gráficos da mesma tela já fazem a concordância ("1 item", "2 coletas").

**Evidência:** [`11-relatorios-plural.jpeg`](ihc/evidencias/11-relatorios-plural.jpeg).

**Recomendação.** Concordância de número: "1 solicitada" e "2 solicitadas".

### P12 — Áreas logadas sem acesso a ajuda

| | |
|---|---|
| **Heurística** | H10 Ajuda e documentação |
| **Severidade** | 1, cosmético |
| **Onde** | Áreas do cliente, do coletor e do administrador |

**Descrição.** A explicação do serviço ("Como funciona") existe só no site público. Dentro das áreas logadas, não há link de ajuda nem respostas a dúvidas comuns, como "em quanto tempo o coletor vem?" ou "o que acontece depois de solicitar?". As descrições de cada etapa na linha do tempo ajudam, mas não cobrem essas dúvidas.

**Recomendação.** Um link "Ajuda" na navegação, com perguntas frequentes por perfil e o "Como funciona".

---

## 5. Pontos fortes

A avaliação também encontrou boas práticas que o redesign deve **preservar**:

| Heurística | Ponto forte |
|---|---|
| H1 | Linha do tempo da coleta com a etapa atual e as próximas, com descrição de cada uma ([`05`](ihc/evidencias/05-cliente-detalhe-pendente.jpeg)). Indicador "Etapa 1 de 3" na solicitação ([`06`](ihc/evidencias/06-solicitar-etapa-endereco.jpeg)) |
| H2 | Linguagem do usuário, em português, com status em termos do dia a dia ("A caminho", "Entregue no ecoponto") |
| H3 | "Voltar" e "Editar" em cada etapa da solicitação. "Voltar ao site" nas telas de login e cadastro |
| H4 | Componentes e cores consistentes entre site e áreas logadas |
| H5 | **Tela de revisão** antes de confirmar a solicitação ([`08`](ihc/evidencias/08-solicitar-revisao.jpeg)). CEP fora de Diadema é recusado já no formulário. Requisitos da senha mostrados enquanto se digita |
| H6 | O CEP preenche rua, bairro, cidade e UF |
| H8 | Telas enxutas: uma ação principal por tela no fluxo do coletor e cartões com só o essencial |
| H9 | Erros de formulário **específicos e junto do campo** ("Informe o e-mail.", "A senha deve ter pelo menos 8 caracteres.") e foco levado ao primeiro campo com erro ([`04`](ihc/evidencias/04-cadastro-erros-celular.jpeg)) |

---

## 6. Prioridades para o redesign

Por severidade, e considerando quem depende de decisão de negócio:

1. **Severidade 3:**
   - **P01** (confirmação nas ações do coletor): pode ser feito já;
   - **P02** (cancelar e corrigir a solicitação): depende da `OQ-021`;
   - **P03** (contato obrigatório para a coleta): depende da `OQ-045`.
2. **Severidade 2, sem dependência:** P05 (ação principal sempre visível), P06 (página 404 própria), P07 (aviso e mensagem de sessão expirada) e P08 (telefone clicável).
3. **Severidade 2, com dependência:**
   - P04 (lista de categorias): depende da `OQ-007`;
   - P09 (endereços anteriores): depende da `OQ-071`.
4. **Cosméticos:** P10, P11 e P12. São simples e podem acompanhar qualquer item acima.

## 7. Próximos passos na disciplina

1. **Consolidação pelo grupo.** Cada integrante faz sua avaliação e o grupo unifica a lista e as severidades, usando este relatório como uma das avaliações.
2. **Redesign centrado no usuário.** Propostas para os problemas priorizados, com protótipos.
3. **Validação empírica.** Testes de usabilidade com usuários reais (cliente e coletor), com tarefas como "solicite uma coleta" e "conclua uma coleta". Medir sucesso, tempo e erros, e aplicar um questionário de satisfação, como o SUS, comparando a versão atual com a nova.
