import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/features/auth/auth-provider";
import { cn } from "@/lib/utils";
import "./globals.css";

// Tipografia oficial (DEC-071): servida pelo próprio site via next/font.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "EcoByte",
    template: "%s | EcoByte",
  },
  description: "Solicite a coleta do seu lixo eletrônico em Diadema-SP. A EcoByte recolhe e leva ao ecoponto.",
};

export const viewport: Viewport = {
  themeColor: "#226891",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" className={cn("font-sans", inter.variable)}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
