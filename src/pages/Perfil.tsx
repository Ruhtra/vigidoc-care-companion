import { useState, useEffect } from "react";
import { 
  User, Phone, Calendar, AlertCircle, FileText, 
  LogOut, ChevronRight, Shield, Download, Edit2, 
  Save, X, Cloud, LogIn, Share2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import VigiDocLogo from "@/components/VigiDocLogo";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, ProfileData } from "@/hooks/useProfile";
import { useVitals } from "@/hooks/useVitals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Perfil = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { profile, loading, saving, updateProfile, getInitials } = useProfile();
  const { vitals } = useVitals();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    full_name: "",
    birth_date: "",
    phone: "",
    emergency_contact: "",
    medical_notes: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        birth_date: profile.birth_date || "",
        phone: profile.phone || "",
        emergency_contact: profile.emergency_contact || "",
        medical_notes: profile.medical_notes || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const result = await updateProfile(formData);
    
    if (result.success) {
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      setIsEditing(false);
    } else {
      toast({
        title: "Erro ao salvar",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const stats = {
    daysRecording: new Set(vitals.map(v => new Date(v.recorded_at).toDateString())).size,
    totalRecords: vitals.length,
    adherence: vitals.length > 0 ? Math.min(100, Math.round((vitals.length / 30) * 100)) : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft">
          <VigiDocLogo size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-center mb-6">
          <VigiDocLogo size="sm" />
        </div>
      </header>

      {/* Login Banner (if not logged in) */}
      {!user && (
        <section className="px-5 mb-6">
          <Link to="/auth">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Cloud className="text-primary" size={24} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Faça login para sincronizar</p>
                <p className="text-sm text-muted-foreground">Seus dados serão salvos na nuvem</p>
              </div>
              <Button size="sm" className="gap-2">
                <LogIn size={16} />
                Entrar
              </Button>
            </div>
          </Link>
        </section>
      )}

      {/* Profile Card */}
      <section className="px-5 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-button">
                  <span className="text-primary-foreground font-bold text-xl">
                    {getInitials()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {profile?.full_name || "Seu Nome"}
                  </h2>
                  {user && (
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  )}
                </div>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="rounded-full"
                >
                  <Edit2 size={18} />
                </Button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-3 pt-4 border-t border-border">
                {profile?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-muted-foreground" />
                    <span className="text-foreground">{profile.phone}</span>
                  </div>
                )}
                {profile?.birth_date && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span className="text-foreground">
                      {new Date(profile.birth_date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
                {profile?.emergency_contact && (
                  <div className="flex items-center gap-3 text-sm">
                    <AlertCircle size={16} className="text-muted-foreground" />
                    <span className="text-foreground">{profile.emergency_contact}</span>
                  </div>
                )}
                {profile?.medical_notes && (
                  <div className="flex items-start gap-3 text-sm">
                    <FileText size={16} className="text-muted-foreground mt-0.5" />
                    <span className="text-foreground">{profile.medical_notes}</span>
                  </div>
                )}
                {!profile?.phone && !profile?.birth_date && !profile?.emergency_contact && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Toque no ícone de edição para completar seu perfil
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-border animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    placeholder="Seu nome completo"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact">Contato de Emergência</Label>
                  <Input
                    id="emergency_contact"
                    placeholder="Nome e telefone"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medical_notes">Notas Médicas</Label>
                  <Textarea
                    id="medical_notes"
                    placeholder="Medicamentos, alergias, condições de saúde..."
                    value={formData.medical_notes}
                    onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
                    maxLength={1000}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.medical_notes?.length || 0}/1000
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsEditing(false);
                      if (profile) {
                        setFormData({
                          full_name: profile.full_name || "",
                          birth_date: profile.birth_date || "",
                          phone: profile.phone || "",
                          emergency_contact: profile.emergency_contact || "",
                          medical_notes: profile.medical_notes || "",
                        });
                      }
                    }}
                  >
                    <X size={18} className="mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Stats */}
      <section className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-primary">{stats.daysRecording}</p>
              <p className="text-xs text-muted-foreground mt-1">Dias de registro</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-success">{stats.adherence}%</p>
              <p className="text-xs text-muted-foreground mt-1">Adesão</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-foreground">{stats.totalRecords}</p>
              <p className="text-xs text-muted-foreground mt-1">Registros</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Ações Rápidas
        </h3>
        <Card>
          <CardContent className="p-0">
            <Link
              to="/instalar"
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border/50"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Download className="text-primary" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Instalar App</p>
                <p className="text-sm text-muted-foreground">
                  Adicione à tela inicial
                </p>
              </div>
              <ChevronRight className="text-muted-foreground" size={20} />
            </Link>
            
            <Link
              to="/compartilhar"
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left border-b border-border/50"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Share2 className="text-primary" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Compartilhar com Médico</p>
                <p className="text-sm text-muted-foreground">
                  Envie seus dados via link ou QR
                </p>
              </div>
              <ChevronRight className="text-muted-foreground" size={20} />
            </Link>
            
            <Link
              to="/historico"
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="text-primary" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Exportar Dados</p>
                <p className="text-sm text-muted-foreground">
                  Baixe seu histórico em CSV
                </p>
              </div>
              <ChevronRight className="text-muted-foreground" size={20} />
            </Link>
          </CardContent>
        </Card>

        {user && (
          <Button
            variant="ghost"
            className="w-full mt-4 flex items-center justify-center gap-2 py-6 rounded-2xl bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors"
            onClick={handleSignOut}
          >
            <LogOut size={20} />
            Sair da conta
          </Button>
        )}
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
