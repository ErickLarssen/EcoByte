// Cabeçalhos de segurança do site (09 §60–§61, DEC-091).

// Content-Security-Policy estrita, com nonce por requisição (gerada no proxy):
// - scripts: só os do próprio Next.js, que recebem o nonce; 'strict-dynamic'
//   libera os que eles carregam. Script injetado por XSS não tem o nonce;
// - estilos: 'unsafe-inline', porque o nonce não cobre atributos style="",
//   usados por next/image, Radix e a navegação. O risco de CSS injetado é bem
//   menor que o de script, e scripts seguem bloqueados;
// - tudo o mais vem da própria origem (fontes via next/font, API pelo proxy
//   do DEC-063). Nenhum domínio externo é carregado.
export function buildContentSecurityPolicy(nonce: string, isDev: boolean): string {
  const directives = [
    "default-src 'self'",
    // Em desenvolvimento, o React usa eval para as mensagens de erro.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // data: e blob: para os placeholders de imagem do next/image.
    "img-src 'self' blob: data:",
    "font-src 'self'",
    // Em desenvolvimento, o recarregamento automático usa WebSocket.
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ];

  return directives.join("; ");
}

// Cabeçalhos fixos, iguais para todas as respostas (next.config.ts).
export function staticSecurityHeaders(isProduction: boolean): Array<{ key: string; value: string }> {
  return [
    // HTTPS obrigatório por 2 anos, inclusive em subdomínios. Só em produção:
    // em localhost, o navegador passaria a exigir HTTPS.
    ...(isProduction ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Proteção contra clickjacking em navegadores antigos (frame-ancestors na CSP).
    { key: "X-Frame-Options", value: "DENY" },
    // Links externos (ex.: "Como chegar") não recebem o caminho das páginas.
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // Recursos do navegador que o EcoByte não usa ficam desligados.
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
    // Isola a janela de páginas abertas por outros sites.
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];
}
