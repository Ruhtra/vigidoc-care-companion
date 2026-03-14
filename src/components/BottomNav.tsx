import { useAuth } from "@/hooks/useAuth";
import { Home, ClipboardList, Bell, User, LockKeyholeOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Can be false immediately, user is loaded by useAuth

  useEffect(() => {
    // Check if user has admin role via the user object provided by useAuth
    if (user && (user as any).role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
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
