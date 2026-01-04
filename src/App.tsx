import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Historico from "./pages/Historico";
import Lembretes from "./pages/Lembretes";
import Perfil from "./pages/Perfil";
import Instalar from "./pages/Instalar";
import Auth from "./pages/Auth";
import Compartilhar from "./pages/Compartilhar";
import Relatorio from "./pages/Relatorio";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/lembretes" element={<Lembretes />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/instalar" element={<Instalar />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/compartilhar" element={<Compartilhar />} />
          <Route path="/relatorio/:code" element={<Relatorio />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
