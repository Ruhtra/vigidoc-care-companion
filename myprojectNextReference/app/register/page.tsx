import AuthPage from "@/components/AuthPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastre-se | VigiDoc",
  description:
    "Crie sua conta na plataforma VigiDoc de monitoramento inteligente.",
};

export default function RegisterPage() {
  return <AuthPage defaultFlow="register" />;
}
