import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Usando o proxy do Vite ("/api" → localhost:3000) para evitar problemas de
  // SameSite/cross-origin no Chrome com cookies. O baseURL vazio faz o cliente
  // usar o mesmo host do frontend (mesmo origin = sem bloqueio de cookies).
  baseURL: "",
  fetchOptions: {
    credentials: "include",
  },
});
