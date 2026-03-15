import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Ao usar um caminho relativo, o Vite proxy encaminha a requisição
  // para o backend, evitando erros de CORS em desenvolvimento.
  baseURL: window.location.origin,
});
