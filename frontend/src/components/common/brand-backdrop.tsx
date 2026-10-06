import { cn } from "@/lib/utils";

type BrandBackdropProps = {
  // "auth": tela inteira, com brilhos mais presentes; "area": faixa discreta
  // no topo das áreas autenticadas (10 §64: sem excesso de efeitos).
  variant?: "auth" | "area";
  className?: string;
};

// Fundo decorativo com a paleta da marca (DEC-071, DEC-085): malha fina que se
// dissolve nas bordas e brilhos desfocados em azul e verde. Fica atrás do
// conteúdo e é ignorado por leitores de tela. Os brilhos derivam devagar só nas
// telas de autenticação; nas áreas, ficam parados (10 §64, 15 §84). Sem
// movimento com movimento reduzido (15 §98).
export function BrandBackdrop({ variant = "auth", className }: BrandBackdropProps) {
  const auth = variant === "auth";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden",
        auth ? "bottom-0" : "h-80",
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-grid", auth ? "opacity-100" : "opacity-60")} />
      <div
        className={cn(
          "absolute -top-32 -left-24 size-[28rem] rounded-full bg-primary blur-3xl",
          auth && "animate-aurora motion-reduce:animate-none",
          auth ? "opacity-[0.16]" : "opacity-[0.08]",
        )}
      />
      <div
        className={cn(
          "absolute -top-20 right-[-10%] size-[24rem] rounded-full bg-brand-green blur-3xl",
          auth && "animate-aurora [animation-delay:-11s] motion-reduce:animate-none",
          auth ? "opacity-[0.18]" : "opacity-[0.1]",
        )}
      />
      {auth && (
        <div className="absolute -bottom-40 left-1/3 size-[26rem] rounded-full bg-primary blur-3xl animate-aurora [animation-delay:-5s] opacity-[0.1] motion-reduce:animate-none" />
      )}
      {!auth && <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-muted" />}
    </div>
  );
}
