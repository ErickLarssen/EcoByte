import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  // "completa": símbolo + palavra EcoByte; "simbolo": somente o símbolo.
  variant?: "completa" | "simbolo";
  className?: string;
  priority?: boolean;
};

// Logo oficial com proporção preservada (10 §61, 16 §5). Arquivos recortados
// de public/images (originais) para frontend/public/brand.
export function Logo({ variant = "completa", className, priority }: LogoProps) {
  if (variant === "simbolo") {
    return (
      <Image
        src="/brand/ecobyte-mark.png"
        alt="EcoByte"
        width={491}
        height={242}
        priority={priority}
        className={cn("h-8 w-auto", className)}
      />
    );
  }

  return (
    <Image
      src="/brand/ecobyte-logo.png"
      alt="EcoByte"
      width={495}
      height={338}
      priority={priority}
      className={cn("h-16 w-auto", className)}
    />
  );
}
