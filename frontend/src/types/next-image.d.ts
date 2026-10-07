// Tipos dos imports de imagem (`import foto from "@/assets/images/x.webp"`).
// O next-env.d.ts, que também os referencia, é gerado pelo Next.js e fica fora
// do Git; sem esta referência, o typecheck num clone limpo (como no CI) falha
// antes do primeiro `next dev` ou `next build` (DEC-089).
/// <reference types="next/image-types/global" />
