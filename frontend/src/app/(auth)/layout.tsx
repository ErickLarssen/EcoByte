import { Suspense, type ReactNode } from "react";
import { PageLoader } from "@/components/common/page-loader";
import { GuestOnly } from "@/components/features/auth/guest-only";

// Páginas de visitante (DEC-072). GuestOnly lê a query string, por isso
// fica sob Suspense (Next.js 16, useSearchParams).
export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <GuestOnly>{children}</GuestOnly>
    </Suspense>
  );
}
