"use client";

import React, { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useSession } from "@/lib/auth-client";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Bell,
  ChevronRight,
  Download,
  Heart,
  LogIn,
  Menu,
  Moon,
  Smartphone,
  Sun,
  Shield,
  TrendingUp,
  Check,
  X,
  Wifi,
  Users,
  Clock,
  ArrowRight,
  Share,
  SquarePlus,
  MoreVertical,
  Globe,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  fadeInUp,
  staggerContainer,
  cardHover,
  statPop,
  slideInLeft,
  slideInRight,
  fadeIn,
} from "@/animations/variants";

/* ==========================================================================
   VIGIDOC LANDING PAGE
   Modern, premium health-tech landing.
   All sections in one file for simplicity, divided with clear comments.
   ========================================================================== */

// useTheme is now imported from @/hooks/useTheme

// ─── Utility: Scroll-triggered section wrapper ──────────────────────────────
function RevealSection({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.section
      id={id}
      className={className}
      initial={prefersReduced ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
    >
      {children}
    </motion.section>
  );
}

// ─── Landing Page ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const { theme, toggle } = useTheme();
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Recursos", href: "#recursos" },
    { label: "Benefícios", href: "#beneficios" },
    { label: "Instalar", href: "#instalar" },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ================================================================= */}
      {/* --- HEADER (Fixed, Glassmorphism) --- */}
      {/* ================================================================= */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-colors duration-300",
          "bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl",
          "border-b border-slate-200/60 dark:border-white/5",
        )}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="VigiDoc Home"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25 group-hover:shadow-teal-500/40 transition-shadow">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Vigi<span className="text-teal-500">Doc</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-slate-100/60 dark:hover:bg-white/5 transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              aria-label="Alternar tema"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-teal-600 dark:hover:text-teal-400 transition-all hover:rotate-12"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {isPending ? (
              <div className="flex gap-2">
                <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                <div className="h-9 w-36 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
              </div>
            ) : session ? (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-105 transition-all"
              >
                Acessar Plataforma
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-105 transition-all"
                >
                  Começar Agora
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Alternar tema"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label="Menu"
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="top"
                className="w-full sm:w-[350px] bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-l border-slate-200/60 dark:border-white/5 p-6"
              >
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <div className="mt-8 space-y-2">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="pt-2 flex flex-col gap-2">
                    {isPending ? (
                      <>
                        <div className="h-11 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                        <div className="h-11 w-full bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                      </>
                    ) : session ? (
                      <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl shadow-lg shadow-teal-500/25"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Acessar Plataforma
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 rounded-xl"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LogIn className="w-4 h-4" />
                          Entrar
                        </Link>
                        <Link
                          href="/register"
                          className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl shadow-lg shadow-teal-500/25"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Começar Agora
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ================================================================= */}
      {/* --- HERO SECTION --- */}
      {/* ================================================================= */}
      <section className="relative pt-28 pb-16 md:pt-40 md:pb-28 overflow-hidden">
        {/* Background animated blobs */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-teal-400/20 dark:bg-teal-500/10 blur-3xl animate-blob-float" />
          <div className="absolute top-20 -left-40 w-[400px] h-[400px] rounded-full bg-emerald-400/15 dark:bg-emerald-500/8 blur-3xl animate-blob-float [animation-delay:2s]" />
          <div className="absolute -bottom-20 right-1/3 w-[350px] h-[350px] rounded-full bg-teal-300/10 dark:bg-teal-600/8 blur-3xl animate-blob-float [animation-delay:4s]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text column */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              {/* Live badge */}
              <motion.div
                variants={fadeInUp}
                custom={0}
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400 border border-teal-500/20"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75 animate-live-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                </span>
                Monitoramento ao vivo
              </motion.div>

              {/* Hero title */}
              <motion.h1
                variants={fadeInUp}
                custom={0.1}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]"
              >
                <span className="text-slate-900 dark:text-white">
                  Saúde sob{" "}
                </span>
                <span className="bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
                  controle total
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeInUp}
                custom={0.2}
                className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed"
              >
                Plataforma de vigilância ativa que conecta profissionais e
                pacientes com dados em tempo real, alertas inteligentes e
                engajamento mobile.
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                variants={fadeInUp}
                custom={0.35}
                className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                {isPending ? (
                  <div className="h-[52px] w-48 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                ) : session ? (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-105 transition-all duration-300"
                  >
                    Acessar Plataforma
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-105 transition-all duration-300"
                  >
                    Começar Agora
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <a
                  href="#recursos"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-50 dark:hover:bg-white/10 hover:scale-105 shadow-sm transition-all duration-300"
                >
                  Conheça os Recursos
                </a>
              </motion.div>
            </motion.div>

            {/* Mockup column – CSS-only dashboard representation */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3,
              }}
              className="relative mx-auto w-full max-w-md lg:max-w-lg"
            >
              <DashboardMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* --- FEATURES GRID --- */}
      {/* ================================================================= */}
      <RevealSection
        id="recursos"
        className="py-20 md:py-28 bg-slate-50/50 dark:bg-white/[0.02]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 mb-4 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400 border border-teal-500/20 tracking-wide uppercase">
              Recursos
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tecnologia que{" "}
              <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                salva vidas
              </span>
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
              Três pilares que transformam o cuidado ao paciente, do hospital ao
              celular.
            </p>
          </motion.div>

          {/* Cards grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Vigilância Ativa",
                description:
                  "Monitoramento contínuo de sinais vitais com alertas automáticos para a equipe médica. Nenhum detalhe passa despercebido.",
                gradient: "from-teal-500 to-teal-600",
              },
              {
                icon: BarChart3,
                title: "Dados em Tempo Real",
                description:
                  "Dashboards interativos com métricas atualizadas em tempo real. Tomada de decisão rápida e baseada em evidências.",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                icon: Smartphone,
                title: "Engajamento Mobile",
                description:
                  "Pacientes acompanham sua jornada de saúde direto do celular. Lembretes, histórico e comunicação em um toque.",
                gradient: "from-teal-400 to-emerald-500",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                custom={i * 0.1}
                whileHover="hover"
                initial="rest"
                animate="rest"
              >
                <motion.div
                  variants={cardHover}
                  className={cn(
                    "relative group p-7 rounded-2xl border transition-all duration-300 h-full",
                    "bg-white dark:bg-slate-900/60",
                    "border-slate-200/70 dark:border-white/5",
                    "hover:border-teal-500/30 dark:hover:border-teal-500/20",
                    "hover:shadow-xl hover:shadow-teal-500/5",
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-xl mb-5",
                      "bg-gradient-to-br shadow-lg",
                      feature.gradient,
                      "shadow-teal-500/20 text-white",
                    )}
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ================================================================= */}
      {/* --- BENEFITS & STATS --- */}
      {/* ================================================================= */}
      <RevealSection id="beneficios" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left – text & benefits */}
            <motion.div variants={slideInLeft}>
              <span className="inline-block px-4 py-1.5 mb-4 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400 border border-teal-500/20 tracking-wide uppercase">
                Benefícios
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-5">
                Resultados que{" "}
                <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                  importam
                </span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8 text-base">
                O VigiDoc redefine como hospitais e equipes de saúde acompanham
                seus pacientes — com prevenção, inteligência e proximidade.
              </p>
              <ul className="space-y-4">
                {[
                  "Redução significativa de reinternações hospitalares",
                  "Alertas em tempo real para sinais vitais fora do padrão",
                  "Comunicação fluida entre equipe médica e paciente",
                  "Acessível como PWA — sem download de app stores",
                  "Dados centralizados para auditoria e compliance",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-teal-500/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-teal-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right – stat cards */}
            <motion.div
              variants={slideInRight}
              className="grid grid-cols-2 gap-4"
            >
              {[
                {
                  value: "40%",
                  label: "Menos Reinternações",
                  icon: TrendingUp,
                },
                { value: "2.5x", label: "Mais Engajamento", icon: Heart },
                { value: "24/7", label: "Vigilância Contínua", icon: Clock },
                {
                  value: "98%",
                  label: "Satisfação dos Pacientes",
                  icon: Users,
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={statPop}
                  custom={i * 0.12}
                  className={cn(
                    "relative p-5 sm:p-6 rounded-2xl border text-center",
                    "bg-white/80 dark:bg-white/5 backdrop-blur-md",
                    "border-slate-200/60 dark:border-white/5",
                    "hover:border-teal-500/30 dark:hover:border-teal-500/20",
                    "hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300",
                  )}
                >
                  <stat.icon className="w-5 h-5 mx-auto mb-3 text-teal-500" />
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </RevealSection>

      {/* ================================================================= */}
      {/* --- PWA INSTALLATION --- */}
      {/* ================================================================= */}
      <RevealSection
        id="instalar"
        className="py-20 md:py-28 bg-slate-50/50 dark:bg-white/[0.02]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 mb-4 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400 border border-teal-500/20 tracking-wide uppercase">
              Instalar
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Instale no seu{" "}
              <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                celular
              </span>
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
              O VigiDoc funciona como um app nativo. Sem app store, sem peso —
              direto do navegador.
            </p>
          </motion.div>

          {/* iOS & Android cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* iOS Card */}
            <motion.div
              variants={fadeInUp}
              custom={0}
              className={cn(
                "p-6 sm:p-8 rounded-2xl border",
                "bg-white dark:bg-slate-900/60",
                "border-slate-200/70 dark:border-white/5",
              )}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-200 dark:to-white flex items-center justify-center text-white dark:text-slate-900">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    iPhone (Safari)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    iOS 14 ou superior
                  </p>
                </div>
              </div>
              <ol className="space-y-4">
                {[
                  {
                    icon: Globe,
                    text: "Abra o VigiDoc no Safari",
                  },
                  {
                    icon: Share,
                    text: 'Toque no ícone de "Compartilhar"',
                  },
                  {
                    icon: SquarePlus,
                    text: 'Selecione "Adicionar à Tela de Início"',
                  },
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <step.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-teal-500">
                        Passo {i + 1}
                      </span>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>

            {/* Android Card */}
            <motion.div
              variants={fadeInUp}
              custom={0.12}
              className={cn(
                "p-6 sm:p-8 rounded-2xl border",
                "bg-white dark:bg-slate-900/60",
                "border-slate-200/70 dark:border-white/5",
              )}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Android (Chrome)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Chrome 80 ou superior
                  </p>
                </div>
              </div>
              <ol className="space-y-4">
                {[
                  {
                    icon: Globe,
                    text: "Abra o VigiDoc no Chrome",
                  },
                  {
                    icon: MoreVertical,
                    text: 'Toque nos "três pontos" (⋮) no canto superior',
                  },
                  {
                    icon: Download,
                    text: 'Selecione "Instalar aplicativo"',
                  },
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <step.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-teal-500">
                        Passo {i + 1}
                      </span>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </RevealSection>

      {/* ================================================================= */}
      {/* --- FOOTER --- */}
      {/* ================================================================= */}
      <footer className="border-t border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Vigi<span className="text-teal-500">Doc</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <a href="#" className="hover:text-teal-500 transition-colors">
                Privacidade
              </a>
              <a href="#" className="hover:text-teal-500 transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="hover:text-teal-500 transition-colors">
                Suporte
              </a>
            </div>

            {/* Copyright */}
            <p className="text-xs text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} VigiDoc. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ========================================================================== */
/* --- DASHBOARD MOCKUP (CSS-only) --- */
/* Pure CSS/HTML representation of a health dashboard, no raster images.       */
/* ========================================================================== */
function DashboardMockup() {
  return (
    <div className="relative">
      {/* Glow behind the card */}
      <div
        className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 dark:from-teal-500/10 dark:to-emerald-500/10 blur-2xl animate-pulse-glow"
        aria-hidden="true"
      />

      {/* Main dashboard frame */}
      <div className="relative rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/10 dark:shadow-black/30 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 mx-4 h-5 rounded-md bg-slate-100 dark:bg-white/5 text-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-5">
              app.vigidoc.com.br
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Mini stat row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Pacientes", val: "128", color: "bg-teal-500" },
              { label: "Alertas", val: "3", color: "bg-amber-500" },
              { label: "Alta Hoje", val: "7", color: "bg-emerald-500" },
            ].map((s) => (
              <div
                key={s.label}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full", s.color)} />
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                    {s.label}
                  </span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {s.val}
                </div>
              </div>
            ))}
          </div>

          {/* Fake chart area */}
          <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">
                Sinais Vitais — 7 dias
              </span>
              <Wifi className="w-3 h-3 text-teal-500" />
            </div>
            {/* Bars */}
            <div className="flex items-end gap-1.5 h-16">
              {[65, 80, 55, 90, 72, 85, 60].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-teal-500 to-emerald-400 opacity-80 dark:opacity-70 transition-all duration-500"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Patient list preview */}
          <div className="space-y-2">
            {[
              { name: "Maria S.", status: "Estável", color: "bg-emerald-500" },
              { name: "João P.", status: "Atenção", color: "bg-amber-500" },
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {p.name[0]}
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    {p.name}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-[9px] font-semibold px-2 py-0.5 rounded-full text-white",
                    p.color,
                  )}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification (with bounce) */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-3 -right-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-white/10 shadow-lg shadow-slate-900/10 dark:shadow-black/20"
      >
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
          <Bell className="w-3 h-3 text-white" />
        </div>
        <div>
          <p className="text-[9px] font-semibold text-slate-800 dark:text-white">
            Alerta de Prioridade
          </p>
          <p className="text-[8px] text-slate-500 dark:text-slate-400">
            Paciente João P. — FC elevada
          </p>
        </div>
      </motion.div>

      {/* Floating live indicator */}
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute -bottom-2 -left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-white/10 shadow-md"
      >
        <div className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-live-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </div>
        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
          Ao vivo
        </span>
      </motion.div>
    </div>
  );
}
