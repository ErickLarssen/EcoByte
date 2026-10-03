import { Check, type LucideIcon } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Blocos das páginas institucionais (10 §63, DEC-080): linguagem mais
// expressiva que a área autenticada, com a mesma paleta e tipografia (DEC-071).

// Texto curto acima do título.
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm font-semibold tracking-wide text-primary uppercase", className)}>{children}</p>;
}

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  image: StaticImageData;
  // Texto alternativo da foto (16 §31).
  imageAlt: string;
  // A Home ocupa mais altura que as páginas internas.
  size?: "home" | "page";
  children?: ReactNode;
};

// Abertura em largura total: foto com movimento lento (Ken Burns), véu escuro
// para contraste e texto claro. Sem animação com movimento reduzido (15 §98).
export function PageHero({ eyebrow, title, description, image, imageAlt, size = "page", children }: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate flex items-center overflow-hidden bg-foreground",
        size === "home" ? "min-h-[78svh]" : "min-h-[52svh]",
      )}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="-z-20 animate-ken-burns object-cover motion-reduce:animate-none"
      />
      {/* Véu: mais escuro à esquerda, onde fica o texto. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-foreground/90 via-foreground/65 to-foreground/25"
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <div className="grid max-w-2xl gap-5 text-white motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
          {eyebrow && <Eyebrow className="text-brand-green">{eyebrow}</Eyebrow>}
          <h1
            className={cn(
              "font-semibold tracking-tight text-balance",
              size === "home" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl lg:text-5xl",
            )}
          >
            {title}
          </h1>
          <p className="text-lg text-white/85 text-pretty sm:text-xl">{description}</p>
          {children && <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{children}</div>}
        </div>
      </div>
    </section>
  );
}

type SiteSectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  muted?: boolean;
  centered?: boolean;
  children: ReactNode;
};

// Seção com título de nível 2. O id permite links diretos (ex.: /sobre#missao).
export function SiteSection({ id, eyebrow, title, description, muted = false, centered = false, children }: SiteSectionProps) {
  const headingId = id ? `${id}-titulo` : undefined;

  return (
    <section id={id} aria-labelledby={headingId} className={cn("scroll-mt-20", muted && "bg-muted")}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:py-20">
        <div className={cn("grid max-w-2xl gap-2", centered && "mx-auto text-center")}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h2 id={headingId} className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h2>
          {description && <p className="text-lg text-muted-foreground text-pretty">{description}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

// Lista de passos numerados (ex.: como funciona a coleta).
export function StepList({ steps }: { steps: Array<{ title: string; description: string }> }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title} className="grid content-start gap-2 rounded-xl border bg-card p-5">
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          >
            {index + 1}
          </span>
          <h3 className="font-semibold">{step.title}</h3>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}

// Foto ilustrativa dentro de uma seção.
export function SectionImage({ image, alt, className }: { image: StaticImageData; alt: string; className?: string }) {
  return (
    <div className={cn("relative aspect-[16/10] overflow-hidden rounded-2xl", className)}>
      <Image src={image} alt={alt} fill placeholder="blur" sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
    </div>
  );
}

// Lista com marcadores de verificação, em duas colunas a partir de sm.
export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <Check className="size-4 shrink-0 text-brand-green" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

type FeatureSplitProps = {
  primary: { image: StaticImageData; alt: string };
  secondary: { image: StaticImageData; alt: string };
  // Cartão de destaque sobre as fotos.
  highlight: { title: string; text: string };
  children: ReactNode;
};

// Composição com duas fotos sobrepostas e um cartão de destaque ao lado do
// texto. No celular, as fotos vêm antes do texto, com a mesma sobreposição.
export function FeatureSplit({ primary, secondary, highlight, children }: FeatureSplitProps) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="relative pr-8 pb-16 sm:pr-16 sm:pb-20">
        <SectionImage image={primary.image} alt={primary.alt} className="aspect-[4/3]" />
        <div className="absolute right-0 bottom-0 w-1/2 overflow-hidden rounded-2xl border-4 border-background shadow-lg">
          <SectionImage image={secondary.image} alt={secondary.alt} className="aspect-[4/3] rounded-none" />
        </div>
        <div className="absolute bottom-4 left-4 max-w-[60%] rounded-2xl bg-primary p-4 text-primary-foreground shadow-lg sm:p-5">
          <p className="text-lg leading-tight font-semibold sm:text-xl">{highlight.title}</p>
          <p className="mt-1 text-sm text-primary-foreground/85">{highlight.text}</p>
        </div>
      </div>
      <div className="grid gap-5">{children}</div>
    </div>
  );
}

export type ServiceCardData = {
  icon: LucideIcon;
  title: string;
  description: string;
  image: StaticImageData;
  imageAlt: string;
  action: ReactNode;
};

// Cartões com foto, ícone, título, texto e ação (ex.: "Para você", "Para empresas").
export function ServiceCards({ cards }: { cards: ServiceCardData[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-3">
      {cards.map((card) => (
        <li key={card.title} className="flex flex-col overflow-hidden rounded-2xl border bg-card">
          <div className="relative aspect-[16/10]">
            <Image src={card.image} alt={card.imageAlt} fill placeholder="blur" sizes="(min-width: 768px) 360px, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-1 flex-col items-center gap-3 p-6 text-center">
            <span className="relative z-10 -mt-12 flex size-14 items-center justify-center rounded-full border-4 border-card bg-secondary text-secondary-foreground">
              <card.icon className="size-6" aria-hidden="true" />
            </span>
            <h3 className="text-xl font-semibold">{card.title}</h3>
            <span aria-hidden="true" className="h-0.5 w-10 rounded-full bg-brand-green" />
            <p className="flex-1 text-muted-foreground">{card.description}</p>
            <div className="mt-2">{card.action}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

type GradientCtaProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  image: StaticImageData;
  imageAlt: string;
  // Cor da seção anterior, de onde o degradê parte, para não haver corte.
  from?: "background" | "muted";
  children: ReactNode;
};

// Chamada para ação sobre foto em largura total. A foto nasce de um degradê
// na cor da seção anterior e se dissolve à esquerda, onde ficam texto e ação.
export function GradientCta({ id, eyebrow, title, description, image, imageAlt, from = "background", children }: GradientCtaProps) {
  const headingId = id ? `${id}-titulo` : undefined;
  const fade = from === "muted" ? "from-muted" : "from-background";

  return (
    <section id={id} aria-labelledby={headingId} className="relative isolate overflow-hidden">
      <Image src={image} alt={imageAlt} fill placeholder="blur" sizes="100vw" className="-z-20 object-cover object-right" />
      {/* Degradê de cima (continuidade com a seção anterior) e da esquerda (leitura). */}
      <div aria-hidden="true" className={cn("absolute inset-x-0 top-0 -z-10 h-2/5 bg-gradient-to-b to-transparent", fade)} />
      <div
        aria-hidden="true"
        className={cn("absolute inset-0 -z-10 bg-gradient-to-r via-60% to-transparent", fade, from === "muted" ? "via-muted/85" : "via-background/85")}
      />
      <div className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="grid max-w-md gap-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 id={headingId} className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">{description}</p>
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </section>
  );
}
