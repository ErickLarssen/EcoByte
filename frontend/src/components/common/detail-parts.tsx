import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Blocos das telas de detalhe, compartilhados entre perfis (11 §134).

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 surface-card p-4 sm:p-6" aria-label={title}>
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center gap-1.5 justify-self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {children}
    </Link>
  );
}

export function DetailSkeleton({ label = "Carregando coleta..." }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="grid gap-4">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-8 w-2/3" aria-hidden="true" />
      <Skeleton className="h-64 w-full rounded-xl" aria-hidden="true" />
      <Skeleton className="h-24 w-full rounded-xl" aria-hidden="true" />
    </div>
  );
}
