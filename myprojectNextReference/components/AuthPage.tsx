"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  User,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Heart,
  Shield,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import Link from "next/link";
import {
  fadeInUp,
  inputStagger,
  inputReveal,
  formSlideIn,
  floatingOrb,
  pulseRing,
  scaleIn,
} from "@/animations/variants";
import { signIn, signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

/* ==========================================================================
   ZOD SCHEMAS
   ========================================================================== */

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu email")
    .email("Formato de email inválido"),
  password: z
    .string()
    .min(1, "Informe sua senha")
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
  remember: z.boolean().optional(),
});

const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "Informe seu nome")
    .min(2, "O nome deve ter pelo menos 2 caracteres"),
  lastName: z
    .string()
    .min(1, "Informe seu sobrenome")
    .min(2, "O sobrenome deve ter pelo menos 2 caracteres"),
  email: z
    .string()
    .min(1, "Informe seu email profissional")
    .email("Formato de email inválido"),
  password: z
    .string()
    .min(1, "Crie uma senha")
    .min(8, "A senha deve ter pelo menos 8 caracteres"),
  terms: z.literal(true, {
    message: "Você deve aceitar os Termos de Serviço",
  }),
});

const forgotSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu email")
    .email("Formato de email inválido"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type ForgotData = z.infer<typeof forgotSchema>;

type AuthFlow = "login" | "register" | "forgot-password";

/* ==========================================================================
   PASSWORD STRENGTH HELPER
   ========================================================================== */

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Fraca", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Razoável", color: "bg-amber-500" };
  if (score <= 3) return { score, label: "Boa", color: "bg-yellow-500" };
  if (score <= 4) return { score, label: "Forte", color: "bg-teal-500" };
  return { score, label: "Excelente", color: "bg-emerald-500" };
}

/* ==========================================================================
   CUSTOM SPINNER COMPONENT
   ========================================================================== */

function VigiSpinner({ className }: { className?: string }) {
  const prefersReduced = useReducedMotion();
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <motion.div
        className="absolute w-6 h-6 rounded-full border-2 border-teal-400/40"
        variants={pulseRing}
        animate={prefersReduced ? undefined : "animate"}
      />
      <Loader2 className="w-5 h-5 animate-spin" />
    </div>
  );
}

/* ==========================================================================
   ANIMATED SUCCESS CHECKMARK
   ========================================================================== */

function SuccessCheck() {
  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-4 py-6"
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full bg-teal-500/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Email enviado com sucesso!
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          Verifique sua caixa de entrada para instruções de recuperação de
          senha.
        </p>
      </div>
    </motion.div>
  );
}

/* ==========================================================================
   AUTH PAGE — main component
   ========================================================================== */

export default function AuthPage({
  defaultFlow = "login",
}: {
  defaultFlow?: AuthFlow;
}) {
  const { theme, toggle } = useTheme();
  const prefersReduced = useReducedMotion();

  const [flow, setFlow] = useState<AuthFlow>(defaultFlow);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showForgotSuccess, setShowForgotSuccess] = useState(false);
  const router = useRouter();

  // --- Navigation helpers ---
  function goTo(target: AuthFlow) {
    const order: AuthFlow[] = ["login", "register", "forgot-password"];
    setDirection(order.indexOf(target) > order.indexOf(flow) ? 1 : -1);
    setShowSuccess(false);
    setShowForgotSuccess(false);
    setFlow(target);
    window.history.pushState(null, "", `/${target}`);
  }

  // --- Login form ---
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  // --- Register form ---
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      terms: undefined as unknown as true,
    },
  });

  // --- Forgot password form ---
  const forgotForm = useForm<ForgotData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  // --- Handlers ---
  async function handleLogin(data: LoginData) {
    setIsLoading(true);
    setSuccessMessage("");
    setShowSuccess(false);

    try {
      await signIn.email(
        {
          email: data.email,
          password: data.password,
          rememberMe: data.remember || false,
        },
        {
          onRequest: () => setIsLoading(true),
          onError: (ctx) => {
            setIsLoading(false);
            loginForm.setError("email", {
              message:
                ctx.error.message ||
                "Credenciais inválidas. Por favor, tente novamente.",
            });
          },
          onSuccess: async (ctx) => {
            const role = ctx.data.user.role;

            setSuccessMessage(
              `Login realizado! Redirecionando para aplicação!`,
            );
            setShowSuccess(true);

            setTimeout(() => {
              router.push(DEFAULT_LOGIN_REDIRECT[role]);
            }, 1500);
          },
        },
      );
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setIsLoading(false);
      loginForm.setError("root", { message: "Ocorreu um erro ao fazer login" });
    }
  }

  async function handleRegister(data: RegisterData) {
    setIsLoading(true);
    setSuccessMessage("");
    setShowSuccess(false);

    try {
      const res = await signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
      });

      setIsLoading(false);

      if (res.error) {
        registerForm.setError("email", {
          message: res.error.message || "Erro ao criar conta",
        });
        return;
      }

      setSuccessMessage("Conta criada com sucesso! Faça login para continuar.");
      setShowSuccess(true);

      setTimeout(() => {
        goTo("login");
        loginForm.setValue("email", data.email);
      }, 2000);
    } catch (err) {
      setIsLoading(false);
      registerForm.setError("root", { message: "Ocorreu um erro no servidor" });
    }
  }

  async function handleForgot(data: ForgotData) {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    console.log("[VigiDoc Auth] Password reset for:", data.email);
    setShowForgotSuccess(true);
  }

  // --- Password visibility ---
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // --- Password strength for register ---
  const regPassword = registerForm.watch("password") || "";
  const passwordStrength = useMemo(
    () => getPasswordStrength(regPassword),
    [regPassword],
  );

  /* ========================================================================
     RENDER
     ======================================================================== */

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* ================================================================= */}
      {/* BRANDING PANEL (left, desktop only ≥1024px)                       */}
      {/* ================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950" />

        {/* Animated floating orbs */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          {[
            {
              size: "w-72 h-72",
              color: "bg-teal-500/15 dark:bg-teal-500/10",
              pos: "top-10 -left-20",
            },
            {
              size: "w-96 h-96",
              color: "bg-emerald-500/10 dark:bg-emerald-500/8",
              pos: "-bottom-20 -right-20",
            },
            {
              size: "w-52 h-52",
              color: "bg-teal-400/20 dark:bg-teal-400/10",
              pos: "top-1/3 right-10",
            },
            {
              size: "w-40 h-40",
              color: "bg-emerald-400/15",
              pos: "bottom-1/4 left-1/4",
            },
          ].map((orb, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={floatingOrb}
              animate={prefersReduced ? undefined : "animate"}
              className={cn(
                "absolute rounded-full blur-3xl",
                orb.size,
                orb.color,
                orb.pos,
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          <Link href="/">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 group"
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/30 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white group-hover:text-teal-400 transition-colors">
                Vigi<span className="text-teal-400">Doc</span>
              </span>
            </motion.div>
          </Link>

          {/* Center — Headline + quote */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.2,
            }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold tracking-tight text-white leading-tight">
                Cuidado que{" "}
                <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  conecta
                </span>
              </h1>
              <p className="mt-4 text-lg text-slate-400 leading-relaxed max-w-md">
                Monitoramento inteligente de saúde que une profissionais e
                pacientes em tempo real.
              </p>
            </div>

            {/* Inspirational quote card */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-teal-500/20 to-emerald-500/20 blur-lg" />
              <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-teal-400" />
                  </div>
                  <span className="text-xs font-medium text-teal-400 uppercase tracking-wide">
                    Nossa missão
                  </span>
                </div>
                <blockquote className="text-sm text-slate-300 leading-relaxed italic">
                  &ldquo;A tecnologia a serviço da saúde: prevenir, monitorar e
                  cuidar com excelência, conectando cada paciente ao melhor
                  cuidado possível.&rdquo;
                </blockquote>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6">
              {[
                { icon: Shield, label: "Dados seguros" },
                { icon: Activity, label: "Tempo real" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 text-slate-400"
                >
                  <badge.icon className="w-4 h-4 text-teal-500" />
                  <span className="text-xs font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom — Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-xs text-slate-600"
          >
            © {new Date().getFullYear()} VigiDoc. Todos os direitos reservados.
          </motion.p>
        </div>
      </div>

      {/* ================================================================= */}
      {/* FORM PANEL (right side / full on mobile)                          */}
      {/* ================================================================= */}
      <div className="flex flex-1 flex-col items-center justify-center relative px-4 py-8 sm:px-8 lg:px-16">
        {/* Subtle background pattern (light mode) */}
        <div
          className="absolute inset-0 opacity-30 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, oklch(0.7 0.02 265) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
          aria-hidden="true"
        />

        {/* Theme toggle — top right */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
          <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Alternar tema"
            className="p-2.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 shadow-sm backdrop-blur-sm transition-colors"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        <Link href="/">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden flex items-center gap-2.5 mb-8 group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
              Vigi<span className="text-teal-500">Doc</span>
            </span>
          </motion.div>
        </Link>

        {/* ─── Form Card ─── */}
        <div className="relative z-10 w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ═══════════ LOGIN ═══════════ */}
            {flow === "login" && (
              <motion.div
                key="login"
                custom={direction}
                variants={formSlideIn}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 p-6 sm:p-8">
                  {/* Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Bem-vindo de volta
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Entre com suas credenciais para acessar a plataforma.
                    </p>
                  </div>

                  {/* Success message */}
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        variants={scaleIn}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="mb-4 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 text-sm flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {successMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form */}
                  <form
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    noValidate
                  >
                    <motion.div
                      variants={inputStagger}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {/* Email */}
                      <motion.div variants={inputReveal}>
                        <label
                          htmlFor="login-email"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                        >
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                          <input
                            id="login-email"
                            type="email"
                            autoComplete="email"
                            placeholder="voce@hospital.com.br"
                            className={cn(
                              "w-full h-11 pl-10 pr-4 rounded-xl border bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500",
                              loginForm.formState.errors.email
                                ? "border-red-400 dark:border-red-500/60 ring-1 ring-red-400/20"
                                : "border-slate-200 dark:border-white/10",
                            )}
                            {...loginForm.register("email")}
                          />
                        </div>
                        {loginForm.formState.errors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-xs text-red-500"
                          >
                            {loginForm.formState.errors.email.message}
                          </motion.p>
                        )}
                      </motion.div>

                      {/* Password */}
                      <motion.div variants={inputReveal}>
                        <label
                          htmlFor="login-password"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                        >
                          Senha
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                          <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className={cn(
                              "w-full h-11 pl-10 pr-11 rounded-xl border bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500",
                              loginForm.formState.errors.password
                                ? "border-red-400 dark:border-red-500/60 ring-1 ring-red-400/20"
                                : "border-slate-200 dark:border-white/10",
                            )}
                            {...loginForm.register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            aria-label={
                              showPassword ? "Ocultar senha" : "Mostrar senha"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-xs text-red-500"
                          >
                            {loginForm.formState.errors.password.message}
                          </motion.p>
                        )}
                      </motion.div>

                      {/* Remember + Forgot */}
                      <motion.div
                        variants={inputReveal}
                        className="flex items-center justify-between"
                      >
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded-md border border-slate-300 dark:border-white/20 text-teal-500 focus:ring-teal-500/40 bg-white dark:bg-white/5 transition-colors accent-teal-500"
                            {...loginForm.register("remember")}
                          />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Lembrar de mim
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => goTo("forgot-password")}
                          className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors"
                        >
                          Esqueci a senha
                        </button>
                      </motion.div>

                      {/* Submit */}
                      <motion.div variants={inputReveal} className="pt-2">
                        <motion.button
                          type="submit"
                          disabled={isLoading}
                          whileHover={isLoading ? {} : { scale: 1.02 }}
                          whileTap={isLoading ? {} : { scale: 0.98 }}
                          className={cn(
                            "relative w-full h-12 rounded-xl font-semibold text-sm text-white transition-all duration-300",
                            "bg-gradient-to-r from-teal-500 to-emerald-500",
                            "shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40",
                            "disabled:opacity-70 disabled:cursor-not-allowed",
                            "focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950",
                          )}
                        >
                          {isLoading ? (
                            <VigiSpinner className="mx-auto text-white" />
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              Entrar
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          )}
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  </form>

                  {/* Divider + Register link */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Não tem uma conta?{" "}
                      <button
                        onClick={() => goTo("register")}
                        className="text-teal-600 dark:text-teal-400 font-semibold hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                      >
                        Cadastre-se agora
                      </button>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════════ REGISTER ═══════════ */}
            {flow === "register" && (
              <motion.div
                key="register"
                custom={direction}
                variants={formSlideIn}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 p-6 sm:p-8">
                  {/* Header */}
                  <div className="mb-6">
                    <button
                      onClick={() => goTo("login")}
                      className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-3 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar ao login
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Crie sua conta
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Junte-se à plataforma de monitoramento VigiDoc.
                    </p>
                  </div>

                  {/* Success message */}
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        variants={scaleIn}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="mb-4 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-400 text-sm flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {successMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form */}
                  <form
                    onSubmit={registerForm.handleSubmit(handleRegister)}
                    noValidate
                  >
                    <motion.div
                      variants={inputStagger}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {/* Name row */}
                      <motion.div
                        variants={inputReveal}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        <div>
                          <label
                            htmlFor="reg-firstname"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                          >
                            Nome
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                            <input
                              id="reg-firstname"
                              type="text"
                              autoComplete="given-name"
                              placeholder="João"
                              className={cn(
                                "w-full h-11 pl-10 pr-4 rounded-xl border bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500",
                                registerForm.formState.errors.firstName
                                  ? "border-red-400 dark:border-red-500/60 ring-1 ring-red-400/20"
                                  : "border-slate-200 dark:border-white/10",
                              )}
                              {...registerForm.register("firstName")}
                            />
                          </div>
                          {registerForm.formState.errors.firstName && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1 text-xs text-red-500"
                            >
                              {registerForm.formState.errors.firstName.message}
                            </motion.p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="reg-lastname"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                          >
                            Sobrenome
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                            <input
                              id="reg-lastname"
                              type="text"
                              autoComplete="family-name"
                              placeholder="Silva"
                              className={cn(
                                "w-full h-11 pl-10 pr-4 rounded-xl border bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500",
                                registerForm.formState.errors.lastName
                                  ? "border-red-400 dark:border-red-500/60 ring-1 ring-red-400/20"
                                  : "border-slate-200 dark:border-white/10",
                              )}
                              {...registerForm.register("lastName")}
                            />
                          </div>
                          {registerForm.formState.errors.lastName && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1 text-xs text-red-500"
                            >
                              {registerForm.formState.errors.lastName.message}
                            </motion.p>
                          )}
                        </div>
                      </motion.div>

                      {/* Email */}
                      <motion.div variants={inputReveal}>
                        <label
                          htmlFor="reg-email"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                        >
                          Email Profissional
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                          <input
                            id="reg-email"
                            type="email"
                            autoComplete="email"
                            placeholder="voce@hospital.com.br"
                            className={cn(
                              "w-full h-11 pl-10 pr-4 rounded-xl border bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500",
                              registerForm.formState.errors.email
                                ? "border-red-400 dark:border-red-500/60 ring-1 ring-red-400/20"
                                : "border-slate-200 dark:border-white/10",
                            )}
                            {...registerForm.register("email")}
                          />
                        </div>
                        {registerForm.formState.errors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-xs text-red-500"
                          >
                            {registerForm.formState.errors.email.message}
                          </motion.p>
                        )}
                      </motion.div>

                      {/* Password + Strength */}
                      <motion.div variants={inputReveal}>
                        <label
                          htmlFor="reg-password"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                        >
                          Senha
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                          <input
                            id="reg-password"
                            type={showRegPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Mínimo 8 caracteres"
                            className={cn(
                              "w-full h-11 pl-10 pr-11 rounded-xl border bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500",
                              registerForm.formState.errors.password
                                ? "border-red-400 dark:border-red-500/60 ring-1 ring-red-400/20"
                                : "border-slate-200 dark:border-white/10",
                            )}
                            {...registerForm.register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            aria-label={
                              showRegPassword
                                ? "Ocultar senha"
                                : "Mostrar senha"
                            }
                          >
                            {showRegPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {registerForm.formState.errors.password && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-xs text-red-500"
                          >
                            {registerForm.formState.errors.password.message}
                          </motion.p>
                        )}

                        {/* Password strength bar */}
                        {regPassword.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                <motion.div
                                  className={cn(
                                    "h-full rounded-full transition-colors duration-300",
                                    passwordStrength.color,
                                  )}
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${(passwordStrength.score / 5) * 100}%`,
                                  }}
                                  transition={{
                                    duration: 0.4,
                                    ease: "easeOut",
                                  }}
                                />
                              </div>
                              <span
                                className={cn(
                                  "text-xs font-medium",
                                  passwordStrength.score <= 1
                                    ? "text-red-500"
                                    : passwordStrength.score <= 2
                                      ? "text-amber-500"
                                      : passwordStrength.score <= 3
                                        ? "text-yellow-500"
                                        : "text-teal-500",
                                )}
                              >
                                {passwordStrength.label}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Terms */}
                      <motion.div variants={inputReveal}>
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="mt-0.5 w-4 h-4 rounded-md border border-slate-300 dark:border-white/20 text-teal-500 focus:ring-teal-500/40 bg-white dark:bg-white/5 transition-colors accent-teal-500"
                            {...registerForm.register("terms")}
                          />
                          <span className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
                            Eu aceito os{" "}
                            <a
                              href="#"
                              className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
                            >
                              Termos de Serviço
                            </a>{" "}
                            e a{" "}
                            <a
                              href="#"
                              className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
                            >
                              Política de Privacidade
                            </a>
                          </span>
                        </label>
                        {registerForm.formState.errors.terms && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-xs text-red-500"
                          >
                            {registerForm.formState.errors.terms.message}
                          </motion.p>
                        )}
                      </motion.div>

                      {/* Submit */}
                      <motion.div variants={inputReveal} className="pt-2">
                        <motion.button
                          type="submit"
                          disabled={isLoading}
                          whileHover={isLoading ? {} : { scale: 1.02 }}
                          whileTap={isLoading ? {} : { scale: 0.98 }}
                          className={cn(
                            "relative w-full h-12 rounded-xl font-semibold text-sm text-white transition-all duration-300",
                            "bg-gradient-to-r from-teal-500 to-emerald-500",
                            "shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40",
                            "disabled:opacity-70 disabled:cursor-not-allowed",
                            "focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950",
                          )}
                        >
                          {isLoading ? (
                            <VigiSpinner className="mx-auto text-white" />
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              Criar conta
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          )}
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  </form>

                  {/* Footer */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Já tem uma conta?{" "}
                      <button
                        onClick={() => goTo("login")}
                        className="text-teal-600 dark:text-teal-400 font-semibold hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                      >
                        Fazer login
                      </button>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══════════ FORGOT PASSWORD ═══════════ */}
            {flow === "forgot-password" && (
              <motion.div
                key="forgot"
                custom={direction}
                variants={formSlideIn}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-xl shadow-slate-900/5 dark:shadow-black/20 p-6 sm:p-8">
                  {/* Header */}
                  <div className="mb-6">
                    <button
                      onClick={() => goTo("login")}
                      className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 mb-3 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar ao login
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Recuperar senha
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Informe seu email para receber instruções de recuperação.
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {showForgotSuccess ? (
                      <SuccessCheck key="success" />
                    ) : (
                      <motion.form
                        key="forgot-form"
                        onSubmit={forgotForm.handleSubmit(handleForgot)}
                        noValidate
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <motion.div
                          variants={inputStagger}
                          initial="hidden"
                          animate="visible"
                          className="space-y-4"
                        >
                          {/* Email */}
                          <motion.div variants={inputReveal}>
                            <label
                              htmlFor="forgot-email"
                              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                            >
                              Email
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                              <input
                                id="forgot-email"
                                type="email"
                                autoComplete="email"
                                placeholder="voce@hospital.com.br"
                                className={cn(
                                  "w-full h-11 pl-10 pr-4 rounded-xl border bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500",
                                  forgotForm.formState.errors.email
                                    ? "border-red-400 dark:border-red-500/60 ring-1 ring-red-400/20"
                                    : "border-slate-200 dark:border-white/10",
                                )}
                                {...forgotForm.register("email")}
                              />
                            </div>
                            {forgotForm.formState.errors.email && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-1 text-xs text-red-500"
                              >
                                {forgotForm.formState.errors.email.message}
                              </motion.p>
                            )}
                          </motion.div>

                          {/* Submit */}
                          <motion.div variants={inputReveal} className="pt-2">
                            <motion.button
                              type="submit"
                              disabled={isLoading}
                              whileHover={isLoading ? {} : { scale: 1.02 }}
                              whileTap={isLoading ? {} : { scale: 0.98 }}
                              className={cn(
                                "relative w-full h-12 rounded-xl font-semibold text-sm text-white transition-all duration-300",
                                "bg-gradient-to-r from-teal-500 to-emerald-500",
                                "shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40",
                                "disabled:opacity-70 disabled:cursor-not-allowed",
                                "focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950",
                              )}
                            >
                              {isLoading ? (
                                <VigiSpinner className="mx-auto text-white" />
                              ) : (
                                "Enviar instruções"
                              )}
                            </motion.button>
                          </motion.div>
                        </motion.div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Back to login after success */}
                  {showForgotSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-4 text-center"
                    >
                      <button
                        onClick={() => goTo("login")}
                        className="text-sm text-teal-600 dark:text-teal-400 font-semibold hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                      >
                        Voltar ao login
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Copyright (mobile) */}
          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500 lg:hidden">
            © {new Date().getFullYear()} VigiDoc. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
