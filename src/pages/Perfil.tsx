import { useState } from "react";
import { User, Phone, Mail, Building2, LogOut, ChevronRight, Shield } from "lucide-react";
import VigiDocLogo from "@/components/VigiDocLogo";
import BottomNav from "@/components/BottomNav";

const Perfil = () => {
  const [user] = useState({
    name: "João Marcos Silva",
    email: "joao.silva@email.com",
    phone: "(11) 98765-4321",
    birthDate: "15/03/1965",
    clinic: "Hospital São Paulo - Oncologia",
    doctor: "Dra. Maria Santos",
  });

  const menuItems = [
    {
      icon: User,
      label: "Dados Pessoais",
      description: "Nome, data de nascimento, contato",
    },
    {
      icon: Building2,
      label: "Minha Clínica",
      description: "Informações do seu tratamento",
    },
    {
      icon: Shield,
      label: "Privacidade",
      description: "Controle de dados e permissões",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <VigiDocLogo size="sm" />
        </div>
      </header>

      {/* Profile Card */}
      <section className="px-5 mb-6">
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-button">
              <span className="text-primary-foreground font-bold text-xl">
                JM
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-border space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Phone size={16} className="text-muted-foreground" />
              <span className="text-foreground">{user.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building2 size={16} className="text-muted-foreground" />
              <span className="text-foreground">{user.clinic}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-primary">28</p>
            <p className="text-xs text-muted-foreground mt-1">Dias de registro</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-success">95%</p>
            <p className="text-xs text-muted-foreground mt-1">Adesão</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-foreground">156</p>
            <p className="text-xs text-muted-foreground mt-1">Registros</p>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="px-5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Configurações
        </h3>
        <div className="bg-card rounded-2xl overflow-hidden shadow-card">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left ${
                index < menuItems.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <item.icon className="text-primary" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="text-muted-foreground" size={20} />
            </button>
          ))}
        </div>

        <button className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors">
          <LogOut size={20} />
          Sair da conta
        </button>
      </section>

      {/* Version */}
      <div className="text-center mt-8 text-sm text-muted-foreground">
        <VigiDocLogo size="sm" showText={false} />
        <p className="mt-2">Versão 1.0.0</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Perfil;
