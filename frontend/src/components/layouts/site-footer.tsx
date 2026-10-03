import Image from "next/image";
import Link from "next/link";
import { SITE_NAVIGATION } from "@/lib/site-navigation";

const ACCOUNT_LINKS = [
  { href: "/entrar", label: "Entrar" },
  { href: "/cadastro", label: "Criar conta" },
  { href: "/cadastro?tipo=PJ", label: "Cadastro de empresa ou instituição" },
];

const FOOTER_LINK = "text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline";

// Rodapé institucional (DEC-079, DEC-080): fundo escuro da paleta, mais alto,
// com o símbolo da marca como marca d'água à esquerda. Canais de contato
// ainda não definidos (OQ-046) não são exibidos.
export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden bg-foreground text-white">
      <Image
        src="/brand/ecobyte-mark.png"
        alt=""
        width={491}
        height={242}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -left-24 -z-10 w-[28rem] max-w-none -translate-y-1/2 opacity-[0.07] sm:-left-16"
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-2 sm:py-20 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="grid content-start gap-4 sm:col-span-2 lg:col-span-1">
          <Link
            href="/"
            className="flex items-center gap-2 justify-self-start rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-white/50"
          >
            <Image src="/brand/ecobyte-mark.png" alt="" width={491} height={242} className="h-8 w-auto" />
            <span className="text-xl font-semibold tracking-tight">EcoByte</span>
          </Link>
          <p className="max-w-sm text-white/70">
            Coleta de lixo eletrônico em Diadema-SP. Você solicita, a equipe EcoByte recolhe e leva o material ao nosso
            ecoponto.
          </p>
        </div>

        <nav aria-label="Institucional">
          <p className="mb-4 font-semibold">Institucional</p>
          <ul className="grid gap-3">
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
          <p className="mb-4 font-semibold">Conta</p>
          <ul className="grid gap-3">
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
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-sm text-white/60">© {new Date().getFullYear()} EcoByte · Diadema-SP</p>
      </div>
    </footer>
  );
}
