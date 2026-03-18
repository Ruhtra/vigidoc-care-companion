import { useState, useEffect } from "react";
import { authClient } from "../lib/auth-client";

export const useAuth = () => {
  const { data: sessionData, isPending: loading } = authClient.useSession();

  const user = sessionData?.user ?? null;
  const session = sessionData?.session ?? null;

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name: fullName || "Usuário",
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    // Clear all sensitive health data from localStorage before signing out
    localStorage.removeItem("vigidoc_vitals");
    localStorage.removeItem("vigidoc_profile");
    localStorage.removeItem("vigidoc_reminders");

    const { error } = await authClient.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
};
