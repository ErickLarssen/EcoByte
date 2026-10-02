import type { Metadata } from "next";
import { ProfilePage } from "@/components/features/profile/profile-page";

export const metadata: Metadata = { title: "Meu perfil" };

export default function MeuPerfilPage() {
  return <ProfilePage />;
}
