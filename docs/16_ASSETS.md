# 16 — ASSETS

## 1. Objetivo

Este documento define as regras para organização, utilização, otimização e manutenção dos assets visuais do EcoByte.

Consideram-se assets:

```text
logos
ícones
imagens
fotografias
ilustrações
vídeos
animações
fontes
favicons
SVGs
backgrounds
elementos decorativos
```

O objetivo é garantir:

- consistência visual;
- organização;
- reutilização;
- performance;
- acessibilidade;
- manutenção simplificada;
- integridade da identidade visual.

Este documento deve permanecer alinhado com:

```text
docs/10_DESIGN_SYSTEM.md
docs/11_COMPONENTS.md
docs/12_RESPONSIVENESS_ACCESSIBILITY.md
docs/15_INTERACTIONS_MOTION.md
```

---

# 2. Princípios

## AS-001 — Assets devem possuir finalidade

Todo asset utilizado na aplicação deve possuir uma função clara.

Não adicionar arquivos somente porque:

```text
"ficam bonitos"
```

ou:

```text
"talvez sejam úteis depois"
```

---

## AS-002 — Reutilização

Quando o mesmo asset for utilizado em diferentes partes da aplicação:

```text
reutilizar o arquivo
```

em vez de criar cópias.

---

## AS-003 — Organização

Os assets devem permanecer organizados por finalidade.

Exemplo:

```text
assets/
├── brand/
├── icons/
├── images/
├── illustrations/
├── videos/
├── fonts/
└── backgrounds/
```

A estrutura definitiva pode ser adaptada à organização final do frontend.

---

## AS-004 — Performance

Assets devem possuir tamanho e formato adequados à sua finalidade.

Evitar:

```text
imagens gigantes
vídeos desnecessariamente pesados
fontes não utilizadas
SVGs complexos sem necessidade
```

---

## AS-005 — Acessibilidade

Assets informativos devem possuir alternativas acessíveis quando necessário.

---

# 3. Estrutura de diretórios

Estrutura recomendada:

```text
src/
└── assets/
    ├── brand/
    ├── icons/
    ├── images/
    ├── illustrations/
    ├── videos/
    ├── fonts/
    └── backgrounds/
```

Assets públicos que precisem ser servidos diretamente podem utilizar:

```text
public/
```

conforme a necessidade da stack.

---

# 4. `brand`

Diretório destinado à identidade visual do EcoByte.

Pode conter:

```text
logo
logotipo
símbolo
versões monocromáticas
versões para fundo claro
versões para fundo escuro
favicon
```

---

# 5. Logo

A logo oficial deve possuir:

```text
proporção preservada
boa resolução
variações adequadas
```

Nunca:

```text
esticar
comprimir
deformar
inclinar artificialmente
```

---

# 6. Versões da logo

Quando existirem diferentes versões oficiais:

```text
logo-primary
logo-dark
logo-light
logo-mark
logo-horizontal
```

os nomes devem ser consistentes.

Não criar versões arbitrárias apenas alterando filtros ou cores diretamente no componente.

---

# 7. Logo em fundos claros

Utilizar a versão que preserve:

```text
contraste
legibilidade
identidade
```

---

# 8. Logo em fundos escuros

Utilizar a versão apropriada para fundos escuros.

Não utilizar uma versão com baixo contraste apenas para manter determinada combinação estética.

---

# 9. Logo reduzida

Quando a largura disponível for limitada, pode existir uma versão reduzida:

```text
logo-mark
```

ou símbolo equivalente.

A versão reduzida deve continuar sendo reconhecível.

---

# 10. Área de proteção

A logo deve possuir espaço visual adequado ao seu redor.

Evitar posicionar elementos diretamente encostados nela.

A quantidade exata deve seguir as definições da identidade visual quando existirem.

---

# 11. Favicon

O projeto deve possuir favicon apropriado.

Exemplos:

```text
favicon.ico
favicon.svg
```

Quando existir uma versão simplificada da marca, ela pode ser utilizada.

---

# 12. App Icons

Caso exista instalação como PWA ou aplicação equivalente, considerar:

```text
icon-192
icon-512
```

ou formatos equivalentes conforme a configuração final.

Não criar esses arquivos sem necessidade real do produto.

---

# 13. SVG

Preferir SVG para:

```text
logos
ícones
símbolos
ilustrações vetoriais
```

quando a natureza do asset permitir.

Vantagens:

```text
escalabilidade
boa qualidade
tamanho potencialmente reduzido
```

---

# 14. Sanitização de SVG

SVGs externos devem ser avaliados antes de serem incorporados ao projeto.

Não utilizar SVGs de origem desconhecida sem verificar seu conteúdo.

Evitar SVGs contendo scripts ou comportamentos desnecessários.

---

# 15. Ícones

Biblioteca preferencial:

```text
Lucide React
```

Os ícones de biblioteca devem ser preferidos a arquivos individuais quando o mesmo símbolo já existir na biblioteca adotada.

---

# 16. Ícones customizados

Ícones customizados podem ser adicionados quando:

```text
não existir equivalente adequado
```

ou:

```text
o ícone fizer parte da identidade visual
```

---

# 17. Consistência de ícones

Ícones utilizados na mesma interface devem possuir linguagem visual compatível.

Evitar misturar:

```text
outlined
filled
3D
hand-drawn
```

sem decisão visual específica.

---

# 18. Tamanho de ícones

Os tamanhos devem seguir os tokens do Design System.

Exemplo:

```text
16px
18px
20px
24px
32px
```

---

# 19. Imagens

Imagens fotográficas devem ser utilizadas somente quando contribuírem para:

```text
contexto
comunicação
identidade
compreensão
```

---

# 20. Formatos de imagem

Preferências gerais:

```text
WebP
AVIF
PNG
JPEG
SVG
```

A escolha deve depender da finalidade do asset.

---

# 21. WebP / AVIF

Preferir formatos modernos para imagens rasterizadas quando a compatibilidade e a infraestrutura permitirem.

Especialmente em:

```text
fotografias
hero images
backgrounds
```

---

# 22. PNG

Utilizar quando houver necessidade de:

```text
transparência
gráficos específicos
assets que exijam preservação sem perdas
```

Não utilizar PNG para fotografias grandes quando outro formato for mais adequado.

---

# 23. JPEG

Pode ser utilizado para:

```text
fotografias
imagens rasterizadas
```

especialmente quando a transparência não for necessária.

---

# 24. SVG

Preferir para:

```text
logos
ícones
ilustrações vetoriais
gráficos simples
```

---

# 25. Qualidade de imagem

Não utilizar arquivos com resolução muito superior à necessidade real.

Exemplo:

```text
imagem exibida com 600px
```

não precisa necessariamente possuir:

```text
8000px
```

sem justificativa.

---

# 26. Responsividade de imagens

Imagens devem se adaptar ao container.

Exemplo conceitual:

```css
img {
  max-width: 100%;
  height: auto;
}
```

---

# 27. Aspect Ratio

Quando o design exigir proporção específica:

```text
16:9
4:3
1:1
3:2
```

utilizar uma estratégia consistente de aspect ratio.

---

# 28. Object Fit

Quando uma imagem precisar preencher uma área delimitada:

```text
object-fit: cover
```

pode ser utilizado quando o corte for aceitável.

Utilizar:

```text
contain
```

quando preservar o conteúdo completo for mais importante.

---

# 29. Imagens de conteúdo

Imagens informativas devem possuir texto alternativo adequado.

Exemplo:

```html
<img
  src="..."
  alt="Coletor realizando a coleta de equipamentos eletrônicos."
/>
```

---

# 30. Imagens decorativas

Quando uma imagem for puramente decorativa:

```html
<img
  src="..."
  alt=""
/>
```

ou mecanismo equivalente pode ser utilizado.

---

# 31. Alt text

O `alt` deve:

```text
descrever a função/conteúdo da imagem
```

Não utilizar descrições desnecessariamente longas.

---

# 32. Não duplicar informação

Se o texto ao redor já transmitir exatamente a mesma informação da imagem, evitar criar um `alt` redundante.

---

# 33. Background images

Backgrounds devem ser utilizados principalmente para:

```text
decoração
ambientação
hero
efeitos visuais
```

Não utilizar background image para conteúdo que precise ser interpretado como informação principal.

---

# 34. Background e acessibilidade

Uma imagem colocada em background não deve carregar informação essencial que não exista em texto ou outro elemento acessível.

---

# 35. Hero assets

O hero da landing page pode utilizar:

```text
imagem
ilustração
vídeo
gradiente
composição gráfica
```

A escolha deve priorizar:

```text
identidade
legibilidade
performance
```

---

# 36. Hero image

A imagem do hero não deve prejudicar:

```text
headline
CTA
contraste
legibilidade
```

Se necessário, utilizar:

```text
overlay
gradient
blur
surface
```

de maneira controlada.

---

# 37. Ilustrações

Ilustrações devem seguir a linguagem visual do EcoByte.

Evitar misturar estilos incompatíveis.

---

# 38. Ilustrações 3D

Podem ser utilizadas em áreas mais institucionais ou de apresentação, desde que:

```text
performance
identidade
consistência
```

sejam preservadas.

Não transformar todas as interfaces em uma composição 3D.

---

# 39. Fotografias

Fotografias utilizadas no projeto devem:

- possuir boa qualidade;
- estar relacionadas ao produto;
- respeitar direitos de utilização;
- ser otimizadas;
- possuir tratamento visual consistente quando necessário.

---

# 40. Bancos de imagens

Imagens externas devem ser utilizadas somente quando a licença permitir.

Não adicionar ao projeto uma imagem apenas por encontrá-la na internet.

Registrar a origem/licença quando isso for relevante.

---

# 41. Direitos de uso

Assets externos devem possuir permissão de utilização compatível com o projeto.

Quando necessário, registrar:

```text
fonte
autor
licença
URL
```

em documentação apropriada.

---

# 42. Assets de terceiros

Bibliotecas, templates ou pacotes que tragam assets devem ser analisados antes de serem incorporados.

Não copiar assets sem verificar a licença.

---

# 43. Vídeos

Vídeos podem ser utilizados especialmente em:

```text
hero
background
apresentação institucional
seções especiais
```

---

# 44. Vídeos de background

Vídeos de background devem ser:

```text
silenciosos
curtos
otimizados
não essenciais à compreensão
```

---

# 45. Autoplay em vídeos

Vídeos de background podem utilizar autoplay quando apropriado.

Quando houver autoplay:

```text
muted
```

deve ser considerado obrigatório para evitar reprodução inesperada de áudio.

---

# 46. Controles de vídeo

Vídeos decorativos de background normalmente não precisam de controles visíveis.

Vídeos informativos devem considerar:

```text
play
pause
seek
volume
```

quando apropriado.

---

# 47. Poster

Vídeos podem possuir:

```text
poster
```

para exibição durante carregamento.

---

# 48. Formatos de vídeo

Preferir formatos amplamente suportados pela infraestrutura adotada.

Exemplo:

```text
MP4 / H.264
WebM
```

A escolha definitiva depende da estratégia de distribuição.

---

# 49. Compressão de vídeo

Vídeos devem ser comprimidos adequadamente.

Não utilizar:

```text
4K
60fps
```

quando:

```text
1080p
30fps
```

for suficiente para o contexto.

---

# 50. Vídeos em mobile

Vídeos pesados devem possuir estratégia específica para mobile.

Possibilidades:

```text
versão reduzida
poster estático
vídeo desativado
```

quando necessário.

---

# 51. Reduced Motion e vídeo

Se um vídeo for essencialmente decorativo e houver:

```text
prefers-reduced-motion
```

considerar substituir por:

```text
poster
imagem estática
versão reduzida
```

---

# 52. Áudio

O MVP não possui requisito de áudio como parte central da experiência.

Não adicionar sons de interface sem necessidade.

---

# 53. Sons de feedback

Sons para:

```text
success
error
notification
```

não devem ser utilizados como único mecanismo de comunicação.

Caso sejam introduzidos, devem ser opcionais ou utilizados de forma não intrusiva.

---

# 54. Fontes

As fontes fazem parte do Design System.

Quando houver fonte customizada, ela deve estar devidamente licenciada.

---

# 55. Fontes locais

Somente incluir fontes locais quando houver necessidade real.

Evitar incluir dezenas de pesos que nunca serão utilizados.

---

# 56. Formatos de fonte

Preferir formatos modernos como:

```text
WOFF2
```

quando compatíveis com a estratégia da aplicação.

---

# 57. Pesos de fonte

Incluir somente pesos realmente utilizados.

Exemplo:

```text
400
500
600
700
```

Não incluir:

```text
100
200
300
800
900
```

sem necessidade.

---

# 58. Font loading

Fontes devem carregar de maneira a reduzir impacto na percepção da página.

Quando apropriado:

```text
font-display
```

deve ser configurado adequadamente.

---

# 59. Fallback fonts

Sempre existir uma cadeia de fallback apropriada.

Exemplo conceitual:

```css
font-family:
  "Fonte do Projeto",
  system-ui,
  sans-serif;
```

---

# 60. Assets para dark mode

Caso o Dark Mode seja implementado futuramente, alguns assets podem precisar de versões específicas.

Exemplos:

```text
logo-light
logo-dark
illustration-light
illustration-dark
```

Não duplicar assets sem necessidade.

---

# 61. Assets para alto contraste

Quando necessário, assets funcionais devem possuir versões com contraste suficiente.

---

# 62. Assets decorativos

Elementos puramente decorativos não devem competir com o conteúdo principal.

Exemplos:

```text
gradients
blobs
particles
patterns
glows
```

---

# 63. Background patterns

Patterns podem ser utilizados em:

```text
hero
sections especiais
cards destacados
```

Devem permanecer discretos.

---

# 64. Gradientes como assets

Gradientes simples devem preferencialmente ser implementados via CSS em vez de armazenados como imagens.

Exemplo:

```css
background:
  linear-gradient(...);
```

---

# 65. Blobs e formas

Formas decorativas podem ser implementadas usando:

```text
CSS
SVG
```

conforme a complexidade.

---

# 66. Partículas

Sistemas de partículas devem ser utilizados somente quando possuírem justificativa visual.

Evitar:

```text
particles everywhere
```

especialmente em dashboards.

---

# 67. Assets de mapa

Caso mapas sejam adicionados futuramente, considerar:

```text
tiles
markers
icons
attribution
licença
```

A funcionalidade de mapa não faz parte obrigatoriamente do MVP.

---

# 68. Marcadores

Caso sejam utilizados mapas, os marcadores devem possuir:

```text
contraste
identidade visual
acessibilidade quando interativos
```

---

# 69. Estados visuais como assets

Não criar imagens separadas para estados que possam ser implementados com componentes.

Exemplo:

```text
Badge
```

é preferível a:

```text
badge-pendente.png
```

---

# 70. Ícones vs imagens

Quando um conceito puder ser representado por:

```text
ícone vetorial
```

não utilizar uma imagem rasterizada desnecessariamente.

---

# 71. Sprites

Não utilizar sprites tradicionais quando uma biblioteca de ícones ou SVG individual for mais adequada.

---

# 72. Inline SVG

Inline SVG pode ser utilizado quando:

```text
cor dinâmica
animação
interação
```

forem necessárias.

---

# 73. SVG como arquivo

Utilizar SVG como arquivo quando:

```text
asset estático
logo
ilustração
```

for suficiente.

---

# 74. Naming Convention

Nomes dos arquivos devem ser:

```text
claros
consistentes
sem espaços
sem caracteres especiais
```

Preferir:

```text
ecobyte-logo.svg
hero-collection.webp
ecopoint-illustration.svg
```

Evitar:

```text
Imagem Final 2 NOVA.png
logo finalíssima.svg
teste123.png
```

---

# 75. Naming por categoria

Exemplos:

```text
brand/
    ecobyte-logo.svg
    ecobyte-mark.svg

images/
    hero-collection.webp
    electronic-waste.webp

illustrations/
    collection.svg
    recycling.svg

icons/
    custom-location.svg

videos/
    hero-loop.mp4
```

---

# 76. Versões

Quando houver versões do mesmo asset:

```text
hero-desktop.webp
hero-mobile.webp
```

ou convenção equivalente.

Evitar:

```text
hero2
hero-final
hero-final2
hero-new
```

---

# 77. Arquivos duplicados

Não manter:

```text
logo.svg
logo-2.svg
logo-final.svg
logo-final-final.svg
```

quando representam o mesmo asset.

---

# 78. Asset registry

Quando o projeto crescer, pode existir um ponto central de exportação.

Exemplo:

```ts
export const assets = {
  logo: ...,
  hero: ...,
  collectionIllustration: ...
}
```

Não é obrigatório para poucos assets.

---

# 79. Importação de assets

A estratégia de importação deve seguir o bundler utilizado.

Não misturar indiscriminadamente:

```text
import
/public
URL absoluta
```

para a mesma categoria de asset.

---

# 80. Vite

Caso Vite seja utilizado:

```text
src/assets
```

pode conter assets processados pelo bundler.

```text
public/
```

pode conter arquivos que precisem ser servidos diretamente.

A escolha deve possuir motivo claro.

---

# 81. Assets públicos

Utilizar `public/` quando o asset precisar possuir URL pública previsível e não precisar passar pelo processamento do bundler.

Exemplos possíveis:

```text
favicon
robots
arquivos estáticos específicos
```

---

# 82. Assets processados pelo bundler

Utilizar `src/assets/` para assets importados por componentes quando fizer sentido para a stack.

Isso permite:

```text
hash
otimização
referenciamento
```

dependendo da configuração.

---

# 83. Lazy loading

Assets que não forem necessários imediatamente podem ser carregados de maneira tardia.

Exemplos:

```text
imagens abaixo da primeira viewport
vídeos secundários
ilustrações de seções posteriores
```

---

# 84. Preload

Preload deve ser utilizado somente para recursos realmente críticos.

Exemplo potencial:

```text
fonte crítica
hero image
```

Não utilizar preload para dezenas de assets.

---

# 85. Preloading excessivo

Evitar carregar:

```text
todas as imagens
todos os vídeos
todas as fontes
```

na abertura da aplicação.

---

# 86. Responsive images

Quando necessário, utilizar estratégias responsivas para diferentes tamanhos.

Exemplo conceitual:

```html
<picture>
  <source
    media="(max-width: 768px)"
    srcset="hero-mobile.webp"
  />

  <img
    src="hero-desktop.webp"
    alt="..."
  />
</picture>
```

---

# 87. `srcset`

Pode ser utilizado quando houver múltiplas resoluções do mesmo asset.

---

# 88. Imagens críticas

A imagem principal acima da dobra deve possuir estratégia de carregamento adequada.

Evitar:

```text
lazy loading
```

quando isso atrasar significativamente o conteúdo principal.

---

# 89. Dimensões conhecidas

Sempre que possível, fornecer dimensões ou aspect ratio previsível para reduzir:

```text
layout shift
```

---

# 90. CLS

Assets não devem causar deslocamento inesperado do layout durante carregamento.

Reservar espaço apropriado.

---

# 91. Compressão

Antes de adicionar um asset:

```text
otimizar
```

quando possível.

---

# 92. Ferramentas de otimização

Podem ser utilizadas ferramentas apropriadas para:

```text
compressão de imagem
otimização de SVG
compressão de vídeo
subsetting de fontes
```

A ferramenta específica pode variar conforme o workflow.

---

# 93. SVG optimization

SVGs podem ser otimizados removendo:

```text
metadados desnecessários
elementos ocultos
duplicações
espaços desnecessários
```

sem alterar o resultado visual.

---

# 94. Imagens grandes

Não adicionar arquivos enormes ao repositório sem justificativa.

---

# 95. Vídeos grandes

Vídeos de desenvolvimento devem ser revisados antes de entrar no projeto.

Evitar versionar:

```text
vídeos brutos
arquivos de edição
renders intermediários
```

quando somente o arquivo final for necessário.

---

# 96. Arquivos de origem

Não colocar no frontend:

```text
PSD
AI
FIG
BLEND
PRPROJ
AEP
```

a menos que exista uma necessidade explícita.

Esses arquivos podem permanecer em fluxo de design separado.

---

# 97. Assets gerados

Assets gerados por ferramentas de IA ou outras ferramentas devem ser revisados antes de serem incorporados.

Verificar:

```text
qualidade
licença/termos
consistência visual
dimensões
artefatos
```

---

# 98. Imagens geradas por IA

Quando imagens geradas por IA forem utilizadas:

```text
revisar artefatos
otimizar
redimensionar
garantir que o resultado seja adequado ao produto
```

Não assumir que a geração elimina necessidade de revisão.

---

# 99. Vídeos gerados por IA

Mesmas regras:

```text
qualidade
artefatos
peso
licenciamento/termos
performance
```

---

# 100. Assets experimentais

Assets em teste devem permanecer separados.

Exemplo:

```text
assets/experimental/
```

quando necessário.

Não deixar arquivos experimentais misturados aos assets oficiais.

---

# 101. Assets não utilizados

Remover assets que não sejam mais utilizados.

Evitar acumular:

```text
arquivos mortos
```

no repositório.

---

# 102. Auditoria de assets

Periodicamente verificar:

```text
arquivo utilizado?
peso aceitável?
formato apropriado?
nome consistente?
licença conhecida?
duplicado?
```

---

# 103. Asset pesado

Antes de adicionar um asset particularmente pesado:

```text
verificar necessidade
avaliar compressão
avaliar alternativa
```

---

# 104. Assets críticos

Assets que impactem diretamente a identidade do produto devem possuir prioridade de manutenção.

Exemplos:

```text
logo
favicon
fontes
hero principal
ícones de marca
```

---

# 105. Fallback

Quando um asset falhar:

```text
imagem
vídeo
fonte
```

a interface deve possuir comportamento aceitável sempre que possível.

---

# 106. Image fallback

Exemplo:

```text
imagem indisponível
→ placeholder
```

Não permitir áreas quebradas ou ícones de imagem ausentes como única experiência.

---

# 107. Video fallback

Se o vídeo não carregar:

```text
poster
imagem
background estático
```

pode ser utilizado.

O conteúdo deve continuar compreensível.

---

# 108. Font fallback

Se uma fonte customizada não carregar:

```text
system-ui
sans-serif
```

ou fallback equivalente deve manter a interface utilizável.

---

# 109. Asset loading states

Quando um asset exigir carregamento perceptível, utilizar estado adequado.

Exemplo:

```text
skeleton
placeholder
poster
```

---

# 110. Asset error states

Quando uma falha for relevante ao usuário:

```text
mensagem
retry
fallback
```

podem ser utilizados.

---

# 111. Acessibilidade e vídeo

Vídeos informativos podem precisar de:

```text
legendas
transcrição
controles
```

conforme seu conteúdo.

---

# 112. Acessibilidade de ilustrações

Ilustrações meramente decorativas não precisam adicionar informação redundante para leitores de tela.

---

# 113. Acessibilidade de gráficos

Gráficos não devem comunicar informações importantes somente por cores ou elementos visuais.

Quando necessário:

```text
texto
tabela
resumo
```

deve complementar.

---

# 114. Gráficos como assets

Quando um gráfico representar dados dinâmicos, preferir:

```text
componente de gráfico
```

em vez de:

```text
imagem estática
```

---

# 115. Asset vs componente

Regra:

```text
conteúdo visual estático
→ asset

conteúdo visual dinâmico
→ componente
```

---

# 116. Ilustração dinâmica

Quando uma ilustração precisar reagir a:

```text
estado
hover
dados
```

pode ser implementada como:

```text
SVG
+
componente
```

em vez de uma imagem estática.

---

# 117. Motion em SVG

SVGs podem ser animados quando necessário.

A animação deve seguir:

```text
docs/15_INTERACTIONS_MOTION.md
```

---

# 118. Não animar assets diretamente sem necessidade

Se uma animação puder ser obtida com um componente simples:

```text
preferir componente
```

em vez de criar dezenas de arquivos de frames.

---

# 119. Assets de loading

Não criar GIFs de loading quando:

```text
CSS
SVG
Framer Motion
```

forem suficientes.

---

# 120. GIF

GIF deve ser utilizado somente quando realmente necessário.

Para vídeo ou animações complexas, considerar formatos mais eficientes.

---

# 121. Lottie

Lottie pode ser considerado para animações vetoriais complexas quando houver necessidade.

Não adicionar a tecnologia apenas para uma animação simples.

---

# 122. Dependências de assets

Uma nova biblioteca de assets deve ser adicionada somente quando houver necessidade real.

Exemplo:

```text
icon library
animation library
chart library
```

A stack deve permanecer enxuta.

---

# 123. Assets e bundle

Evitar importar assets gigantes que sejam incorporados desnecessariamente ao bundle inicial.

---

# 124. Tree Shaking

Quando a biblioteca utilizada suportar tree shaking, importar somente os elementos necessários.

---

# 125. Assets por rota

Recursos específicos de uma página podem ser carregados somente quando a página for acessada.

Exemplo:

```text
admin chart assets
```

não precisam necessariamente carregar na landing page.

---

# 126. Cache

Assets estáticos devem permitir estratégias adequadas de cache quando a infraestrutura suportar.

---

# 127. Versionamento

O processo de build pode gerar nomes com hash para facilitar cache busting.

Não é necessário renomear manualmente cada asset a cada alteração.

---

# 128. Asset updates

Ao substituir um asset global:

```text
verificar todas as referências
```

antes de remover a versão anterior.

---

# 129. Compatibilidade

Assets devem ser testados nos ambientes-alvo definidos pelo projeto.

---

# 130. Assets mobile

Quando houver uma versão mobile específica:

```text
desktop
mobile
```

as duas devem representar a mesma identidade visual.

Não criar uma estética completamente diferente sem decisão.

---

# 131. Asset de hero mobile

Caso o hero desktop possua composição difícil de adaptar, pode existir:

```text
hero-mobile
```

com enquadramento apropriado.

---

# 132. Diferentes densidades

Quando necessário, utilizar assets adequados a telas de diferentes densidades.

---

# 133. Assets para retina

Imagens críticas podem possuir resolução adequada para displays de alta densidade.

Não duplicar todas as imagens indiscriminadamente.

---

# 134. Performance vs qualidade

A melhor versão do asset não é necessariamente a de maior resolução.

Prioridade:

```text
qualidade suficiente
+
menor peso possível
```

---

# 135. Assets no design

Assets aprovados devem refletir o Design System.

Não adicionar elementos visuais que contradigam:

```text
paleta
tipografia
forma
iconografia
```

---

# 136. Consistência fotográfica

Quando várias fotografias forem utilizadas na mesma área, buscar consistência em:

```text
iluminação
enquadramento
tratamento
temperatura visual
```

quando isso fizer sentido.

---

# 137. Tratamento de imagens

Correções podem incluir:

```text
crop
resize
compressão
correção de exposição
contraste
```

quando necessárias.

Evitar tratamentos inconsistentes entre imagens semelhantes.

---

# 138. Background escuro

Assets utilizados sobre background escuro devem possuir contraste suficiente.

---

# 139. Background claro

Assets utilizados sobre background claro devem possuir contraste suficiente.

---

# 140. Logo sobre imagem

Quando a logo estiver sobre fotografia ou vídeo:

```text
contraste
área limpa
overlay
```

devem ser considerados.

---

# 141. Assets e segurança

Nunca utilizar assets como mecanismos para armazenar:

```text
credenciais
tokens
informações privadas
```

---

# 142. Assets e dados de usuários

Imagens ou arquivos enviados futuramente por usuários devem seguir políticas próprias de:

```text
upload
validação
armazenamento
permissão
```

Isso não faz parte do sistema atual de assets estáticos.

---

# 143. Uploads de usuário

Não confundir:

```text
assets da aplicação
```

com:

```text
arquivos enviados pelos usuários.
```

Arquivos de usuários devem possuir arquitetura de armazenamento própria.

---

# 144. Fonte de verdade dos assets

Os assets oficiais devem estar claramente identificáveis.

Evitar múltiplas versões "oficiais" concorrentes.

---

# 145. Asset manifest

Quando o projeto possuir muitos assets, pode ser útil manter uma referência central:

```text
assets/index.ts
```

ou:

```text
asset-manifest
```

Isso não é obrigatório para uma base pequena.

---

# 146. Importações

Preferir aliases ou caminhos consistentes.

Exemplo:

```text
@/assets/brand/ecobyte-logo.svg
```

quando suportado pela configuração do projeto.

---

# 147. Não usar caminhos frágeis

Evitar imports como:

```text
../../../../../../assets/logo.svg
```

quando aliases puderem melhorar a manutenção.

---

# 148. Assets e testes

Testes visuais devem verificar que:

```text
logo carrega
imagens principais carregam
fallback funciona
ícones aparecem
```

quando esses assets forem críticos.

---

# 149. Assets quebrados

Nunca considerar uma página concluída se houver:

```text
404 de imagem
404 de vídeo
fonte quebrada
SVG ausente
```

sem fallback apropriado.

---

# 150. Console

O projeto não deve apresentar erros desnecessários relacionados a assets no console.

---

# 151. Checklist de brand

```text
[ ] Logo principal
[ ] Logo para fundo claro
[ ] Logo para fundo escuro
[ ] Logo reduzida
[ ] Favicon
[ ] Proporções preservadas
[ ] Contraste validado
```

---

# 152. Checklist de imagens

```text
[ ] Formato adequado
[ ] Resolução adequada
[ ] Compressão
[ ] Alt text
[ ] Aspect ratio
[ ] Fallback quando necessário
[ ] Sem duplicações
```

---

# 153. Checklist de vídeos

```text
[ ] Compressão
[ ] Autoplay somente quando necessário
[ ] Muted em background
[ ] Poster
[ ] Fallback
[ ] Reduced motion considerado
[ ] Mobile considerado
```

---

# 154. Checklist de fontes

```text
[ ] Licença
[ ] WOFF2 quando possível
[ ] Somente pesos necessários
[ ] Fallback
[ ] font-display adequado
```

---

# 155. Checklist de organização

```text
[ ] Nome consistente
[ ] Diretório correto
[ ] Sem duplicações
[ ] Sem arquivos experimentais misturados
[ ] Sem arquivos de origem desnecessários
[ ] Assets não utilizados removidos
```

---

# 156. Checklist de performance

```text
[ ] Imagens otimizadas
[ ] Vídeos comprimidos
[ ] Assets abaixo da dobra com carregamento adequado
[ ] Preload somente quando necessário
[ ] Bundle inicial controlado
[ ] Layout shift minimizado
```

---

# 157. Checklist de acessibilidade

```text
[ ] Alt text
[ ] Contraste
[ ] Ícones com nome acessível
[ ] Assets decorativos corretamente marcados
[ ] Vídeos informativos acessíveis
[ ] Gráficos complementados por informação textual quando necessário
```

---

# 158. Checklist de licenciamento

```text
[ ] Origem conhecida
[ ] Licença compatível
[ ] Uso comercial permitido quando necessário
[ ] Atribuição registrada quando necessária
```

---

# 159. Regra de adição

Antes de adicionar um novo asset:

```text
1. Existe um asset semelhante?
2. Existe uma versão reutilizável?
3. É realmente necessário?
4. Qual é o melhor formato?
5. Qual será o peso?
6. Precisa de versão mobile?
7. Precisa de fallback?
8. Precisa de alt?
9. A licença permite o uso?
10. O asset está no diretório correto?
```

---

# 160. Regra de substituição

Ao substituir um asset global:

```text
1. verificar referências;
2. substituir;
3. testar todas as áreas afetadas;
4. remover versão antiga somente após confirmação;
5. verificar cache/build.
```

---

# 161. Regra contra improvisos

Não criar assets temporários e deixá-los no produto final.

Evitar arquivos como:

```text
placeholder-final.png
teste-logo.svg
temp-bg.jpg
mock-image.webp
```

em produção.

---

# 162. Regra de asset temporário

Assets temporários devem permanecer em uma área claramente identificada ou fora do código final.

---

# 163. Assets e documentação

Assets importantes podem ser referenciados em:

```text
docs/16_ASSETS.md
```

com informações como:

```text
nome
finalidade
localização
variante
licença
```

quando necessário.

---

# 164. Assets e Design System

O asset deve seguir:

```text
docs/10_DESIGN_SYSTEM.md
```

especialmente:

```text
cores
tipografia
iconografia
proporção
estilo visual
```

---

# 165. Assets e Components

Os componentes devem consumir assets através de interfaces consistentes.

Evitar que cada componente defina sua própria estratégia de carregamento para o mesmo asset.

---

# 166. Assets e Motion

Assets animados devem seguir:

```text
docs/15_INTERACTIONS_MOTION.md
```

---

# 167. Assets e acessibilidade

Assets funcionais devem seguir:

```text
docs/12_RESPONSIVENESS_ACCESSIBILITY.md
```

---

# 168. Fonte de verdade

Este documento define as regras gerais para:

```text
organização
nomeação
formato
otimização
acessibilidade
carregamento
utilização
```

dos assets do EcoByte.

---

# 169. Regra final

Os assets do EcoByte devem seguir:

```text
necessidade
    ↓
qualidade
    ↓
consistência
    ↓
performance
    ↓
acessibilidade
    ↓
manutenção
```

Um asset bem utilizado é aquele que:

```text
serve a uma finalidade
possui qualidade suficiente
carrega de maneira eficiente
é acessível quando necessário
está organizado
pode ser reutilizado
```

A identidade visual do produto deve ser preservada sem transformar o repositório em um depósito de arquivos duplicados, pesados ou sem função.