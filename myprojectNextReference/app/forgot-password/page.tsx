import AuthPage from "@/components/AuthPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar Senha | VigiDoc",
  description: "Recupere sua senha de acesso à plataforma VigiDoc.",
};

export default function ForgotPasswordPage() {
  return <AuthPage defaultFlow="forgot-password" />;
}
