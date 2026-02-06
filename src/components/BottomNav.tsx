import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Home, ClipboardList, Bell, User, LockKeyholeOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (!error && data) {
          console.log("entrei");

          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  const navItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: ClipboardList, label: "Histórico", path: "/historico" },
    { icon: Bell, label: "Lembretes", path: "/lembretes" },
    { icon: User, label: "Perfil", path: "/perfil" },
  ];

  // Se o usuário for admin, adiciona o item de admin na posição 2
  const finalNavItems = [...navItems];
  if (isAdmin) {
    finalNavItems.splice(2, 0, {
      icon: LockKeyholeOpen,
      label: "Admin",
      path: "/admin",
    });
  }

  // Não renderizar se não houver usuário
  // if (!user || isLoading) {
  //   return null;
  // }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {finalNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
