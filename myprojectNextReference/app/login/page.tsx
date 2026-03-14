import AuthPage from "@/components/AuthPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar | VigiDoc",
  description: "Faça login na plataforma VigiDoc de monitoramento inteligente.",
};

export default function LoginPage() {
  return <AuthPage defaultFlow="login" />;
}
