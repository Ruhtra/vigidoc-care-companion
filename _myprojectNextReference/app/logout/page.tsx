"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { Loader2, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const pulseRing: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  animate: {
    scale: [0.8, 1.2, 0.8],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function LogoutPage() {
  const router = useRouter();
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    // Adding a small functional delay so the user can see the animated screen
    const timeout = setTimeout(() => {
      authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login"); // Redirect to login page
          },
        },
      });
    }, 1500);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-30 dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, oklch(0.7 0.02 265) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 p-8 text-center shadow-2xl shadow-slate-900/5 dark:shadow-black/20 backdrop-blur-xl"
      >
        <div className="relative flex h-20 w-20 items-center justify-center">
          {/* Animated ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-teal-500/30"
            variants={pulseRing}
            animate={prefersReduced ? undefined : "animate"}
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/30">
            <LogOut className="h-7 w-7 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Encerrando sessão...
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Obrigado por usar o VigiDoc. Até logo!
          </p>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Desconectando de forma segura
        </div>
      </motion.div>
    </div>
  );
}
