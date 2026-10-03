import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { SITE_NAVIGATION } from "@/lib/site-navigation";

const ACCOUNT_LINKS = [
  { href: "/entrar", label: "Entrar" },
  { href: "/cadastro", label: "Criar conta" },
  { href: "/cadastro?tipo=PJ", label: "Cadastro de empresa ou instituição" },
];

const FOOTER_LINK = "text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

// Rodapé institucional (diagrama de navegação, DEC-079). Canais de contato
// ainda não definidos (OQ-046) não são exibidos.
export function SiteFooter() {
  return (
    <footer className="border-t bg-muted">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="grid content-start gap-3 sm:col-span-2 lg:col-span-1">
          <Link
            href="/"
            className="flex items-center gap-2 justify-self-start rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Logo variant="simbolo" className="h-7" />
            <span className="text-lg font-semibold tracking-tight">EcoByte</span>
          </Link>
          <p className="max-w-sm text-sm text-muted-foreground">
            Coleta de lixo eletrônico em Diadema-SP. Você solicita, a equipe EcoByte recolhe e leva o material ao nosso
            ecoponto.
          </p>
        </div>

        <nav aria-label="Institucional">
          <p className="mb-3 text-sm font-semibold">Institucional</p>
          <ul className="grid gap-2 text-sm">
            {SITE_NAVIGATION.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={FOOTER_LINK}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Conta">
          <p className="mb-3 text-sm font-semibold">Conta</p>
          <ul className="grid gap-2 text-sm">
            {ACCOUNT_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={FOOTER_LINK}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} EcoByte · Diadema-SP
        </p>
      </div>
    </footer>
  );
}
