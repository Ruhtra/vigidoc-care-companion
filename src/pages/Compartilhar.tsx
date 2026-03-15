import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { 
  ArrowLeft, Share2, Copy, Check, Link2, QrCode, 
  Calendar, Clock, Trash2, Eye, Plus, Heart, 
  Thermometer, Wind, Scale, Activity, Gauge, User
} from "lucide-react";
import VigiDocLogo from "@/components/VigiDocLogo";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface SharedReport {
  id: string;
  share_code: string;
  title: string;
  include_blood_pressure: boolean;
  include_heart_rate: boolean;
  include_temperature: boolean;
  include_oxygen: boolean;
  include_weight: boolean;
  include_pain: boolean;
  include_profile: boolean;
  date_from: string | null;
  date_to: string | null;
  expires_at: string | null;
  views_count: number;
  is_active: boolean;
  created_at: string;
}

const Compartilhar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [showNewShare, setShowNewShare] = useState(false);
  const [sharedReports, setSharedReports] = useState<SharedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("Meu Relatório de Saúde");
  const [includeBloodPressure, setIncludeBloodPressure] = useState(true);
  const [includeHeartRate, setIncludeHeartRate] = useState(true);
  const [includeTemperature, setIncludeTemperature] = useState(true);
  const [includeOxygen, setIncludeOxygen] = useState(true);
  const [includeWeight, setIncludeWeight] = useState(true);
  const [includePain, setIncludePain] = useState(true);
  const [includeProfile, setIncludeProfile] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expiresIn, setExpiresIn] = useState<"7" | "30" | "never">("7");

  // Load shared reports
  useState(() => {
    if (user) {
      loadReports();
    } else {
      setLoading(false);
    }
  });

  const loadReports = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";
      const res = await fetch(`${baseUrl}/api/shared-reports`);
      if (res.ok) {
        const data = await res.json();
        setSharedReports(data);
      }
    } catch (e) {
      console.error("Erro ao carregar compartilhamentos:", e);
    }
    setLoading(false);
  };

  const generateShareCode = () => {
    // Use cryptographically secure random generation
    return crypto.randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase();
  };

  const handleCreateShare = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para compartilhar seus dados.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    const shareCode = generateShareCode();
    let expiresAt: string | null = null;
    
    if (expiresIn !== "never") {
      const days = parseInt(expiresIn);
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + days);
      expiresAt = expDate.toISOString();
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";
      const res = await fetch(`${baseUrl}/api/shared-reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share_code: shareCode,
          title,
          include_blood_pressure: includeBloodPressure,
          include_heart_rate: includeHeartRate,
          include_temperature: includeTemperature,
          include_oxygen: includeOxygen,
          include_weight: includeWeight,
          include_pain: includePain,
          include_profile: includeProfile,
          date_from: dateFrom || null,
          date_to: dateTo || null,
          expires_at: expiresAt,
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro ao criar compartilhamento");
      }

      toast({
        title: "Link criado!",
        description: "Seu relatório está pronto para ser compartilhado.",
      });
      setShowNewShare(false);
      resetForm();
      loadReports();
    } catch (error: any) {
      toast({
        title: "Erro ao criar compartilhamento",
        description: error.message,
        variant: "destructive",
      });
    }

    setCreating(false);
  };

  const resetForm = () => {
    setTitle("Meu Relatório de Saúde");
    setIncludeBloodPressure(true);
    setIncludeHeartRate(true);
    setIncludeTemperature(true);
    setIncludeOxygen(true);
    setIncludeWeight(true);
    setIncludePain(true);
    setIncludeProfile(false);
    setDateFrom("");
    setDateTo("");
    setExpiresIn("7");
  };

  const handleDelete = async (id: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";
      const res = await fetch(`${baseUrl}/api/shared-reports/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao deletar relatório");
      toast({ title: "Link removido" });
      loadReports();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "";
      const res = await fetch(`${baseUrl}/api/shared-reports/${id}`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive })
      });
      if (res.ok) {
        loadReports();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getShareUrl = (code: string) => {
    return `${window.location.origin}/relatorio/${code}`;
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(getShareUrl(code));
      setCopiedId(code);
      toast({ title: "Link copiado!" });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: "Erro ao copiar", variant: "destructive" });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Compartilhar</h1>
          </div>
        </header>

        <section className="px-5">
          <Card>
            <CardContent className="pt-6 text-center">
              <Share2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Login necessário
              </h2>
              <p className="text-muted-foreground mb-6">
                Faça login para criar links de compartilhamento seguros dos seus dados de saúde.
              </p>
              <Button onClick={() => navigate("/auth")} className="btn-primary">
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </section>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Compartilhar</h1>
            <p className="text-sm text-muted-foreground">
              Envie seus dados para profissionais de saúde
            </p>
          </div>
        </div>
      </header>

      {/* Create New Share Button */}
      {!showNewShare && (
        <section className="px-5 mb-6">
          <Button
            onClick={() => setShowNewShare(true)}
            className="w-full btn-primary gap-2"
          >
            <Plus size={20} />
            Criar novo link de compartilhamento
          </Button>
        </section>
      )}

      {/* New Share Form */}
      {showNewShare && (
        <section className="px-5 mb-6 animate-slide-up">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Novo Compartilhamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título do relatório</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Relatório para Dr. Silva"
                  maxLength={100}
                />
              </div>

              <div className="space-y-3">
                <Label>Dados a incluir</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Gauge size={16} className="text-primary" />
                      <span className="text-sm">Pressão</span>
                    </div>
                    <Switch
                      checked={includeBloodPressure}
                      onCheckedChange={setIncludeBloodPressure}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-red-500" />
                      <span className="text-sm">FC</span>
                    </div>
                    <Switch
                      checked={includeHeartRate}
                      onCheckedChange={setIncludeHeartRate}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Thermometer size={16} className="text-orange-500" />
                      <span className="text-sm">Temp</span>
                    </div>
                    <Switch
                      checked={includeTemperature}
                      onCheckedChange={setIncludeTemperature}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wind size={16} className="text-cyan-500" />
                      <span className="text-sm">SpO₂</span>
                    </div>
                    <Switch
                      checked={includeOxygen}
                      onCheckedChange={setIncludeOxygen}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Scale size={16} className="text-purple-500" />
                      <span className="text-sm">Peso</span>
                    </div>
                    <Switch
                      checked={includeWeight}
                      onCheckedChange={setIncludeWeight}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-pink-500" />
                      <span className="text-sm">Dor</span>
                    </div>
                    <Switch
                      checked={includePain}
                      onCheckedChange={setIncludePain}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    <span className="text-sm">Dados do perfil</span>
                  </div>
                  <Switch
                    checked={includeProfile}
                    onCheckedChange={setIncludeProfile}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">Data início</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">Data fim</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Validade do link</Label>
                <div className="flex gap-2">
                  {[
                    { value: "7", label: "7 dias" },
                    { value: "30", label: "30 dias" },
                    { value: "never", label: "Sem limite" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setExpiresIn(option.value as typeof expiresIn)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        expiresIn === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowNewShare(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 btn-primary"
                  onClick={handleCreateShare}
                  disabled={creating}
                >
                  {creating ? "Criando..." : "Criar Link"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Existing Shares */}
      <section className="px-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Links ativos
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : sharedReports.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Link2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Nenhum link de compartilhamento criado
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sharedReports.map((report) => (
              <Card key={report.id} className={!report.is_active ? "opacity-60" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{report.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Código: <span className="font-mono">{report.share_code}</span>
                      </p>
                    </div>
                    <Switch
                      checked={report.is_active}
                      onCheckedChange={() => handleToggleActive(report.id, report.is_active)}
                    />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {report.views_count} visualizações
                    </span>
                    {report.expires_at && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Expira {new Date(report.expires_at).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => copyToClipboard(report.share_code)}
                    >
                      {copiedId === report.share_code ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                      Copiar Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => setShowQR(showQR === report.share_code ? null : report.share_code)}
                    >
                      <QrCode size={14} />
                      QR
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(report.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>

                  {showQR === report.share_code && (
                    <div className="mt-4 p-4 bg-white rounded-xl flex justify-center animate-fade-in">
                      <QRCodeSVG 
                        value={getShareUrl(report.share_code)} 
                        size={180}
                        level="M"
                        includeMargin
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
};

export default Compartilhar;
