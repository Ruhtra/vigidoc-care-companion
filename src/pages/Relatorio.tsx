import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, AreaChart 
} from "recharts";
import { 
  Heart, Thermometer, Wind, Scale, Activity, Gauge, 
  User, Calendar, Phone, AlertCircle, FileText, Clock
} from "lucide-react";
import VigiDocLogo from "@/components/VigiDocLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface SharedReport {
  id: string;
  user_id: string;
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
  is_active: boolean;
  created_at: string;
}

interface VitalRecord {
  id: string;
  recorded_at: string;
  systolic?: number | null;
  diastolic?: number | null;
  heart_rate?: number | null;
  temperature?: number | null;
  oxygen_saturation?: number | null;
  weight?: number | null;
  pain_level?: number | null;
}

interface Profile {
  full_name: string | null;
  birth_date: string | null;
  phone: string | null;
  emergency_contact: string | null;
  medical_notes: string | null;
}

const Relatorio = () => {
  const { code } = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SharedReport | null>(null);
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (code) {
      loadReport(code);
    }
  }, [code]);

  const loadReport = async (shareCode: string) => {
    setLoading(true);
    setError(null);

    // Get report info
    const { data: reportData, error: reportError } = await supabase
      .from("shared_reports")
      .select("*")
      .eq("share_code", shareCode)
      .eq("is_active", true)
      .maybeSingle();

    if (reportError || !reportData) {
      setError("Relatório não encontrado ou expirado.");
      setLoading(false);
      return;
    }

    // Check expiration
    if (reportData.expires_at && new Date(reportData.expires_at) < new Date()) {
      setError("Este link de compartilhamento expirou.");
      setLoading(false);
      return;
    }

    setReport(reportData as SharedReport);

    // Update views count
    await supabase
      .from("shared_reports")
      .update({ views_count: (reportData.views_count || 0) + 1 })
      .eq("id", reportData.id);

    // Get vitals data
    let query = supabase
      .from("vital_records")
      .select("*")
      .eq("user_id", reportData.user_id)
      .order("recorded_at", { ascending: true });

    if (reportData.date_from) {
      query = query.gte("recorded_at", reportData.date_from);
    }
    if (reportData.date_to) {
      query = query.lte("recorded_at", reportData.date_to + "T23:59:59");
    }

    const { data: vitalsData } = await query;
    if (vitalsData) {
      setVitals(vitalsData);
    }

    // Get profile if included
    if (reportData.include_profile) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, birth_date, phone, emergency_contact, medical_notes")
        .eq("user_id", reportData.user_id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }
    }

    setLoading(false);
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartData = vitals.map((v) => ({
    date: new Date(v.recorded_at).toLocaleDateString("pt-BR", { 
      day: "2-digit", 
      month: "2-digit" 
    }),
    systolic: v.systolic,
    diastolic: v.diastolic,
    heart_rate: v.heart_rate,
    temperature: v.temperature,
    oxygen_saturation: v.oxygen_saturation,
    weight: v.weight,
    pain_level: v.pain_level,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft text-center">
          <VigiDocLogo size="lg" />
          <p className="text-muted-foreground mt-4">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-5">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Relatório Indisponível
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/">
              <button className="btn-primary px-6 py-3">
                Ir para o VigiDoc
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 bg-card border-b border-border">
        <div className="flex items-center justify-center mb-4">
          <VigiDocLogo size="sm" />
        </div>
        <h1 className="text-2xl font-bold text-foreground text-center">
          {report?.title}
        </h1>
        <p className="text-sm text-muted-foreground text-center mt-2 flex items-center justify-center gap-2">
          <Calendar size={14} />
          Gerado em {new Date(report?.created_at || "").toLocaleDateString("pt-BR")}
        </p>
      </header>

      {/* Profile Info */}
      {profile && report?.include_profile && (
        <section className="px-5 py-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User size={18} className="text-primary" />
                Dados do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile.full_name && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Nome:</span>{" "}
                  <span className="font-medium">{profile.full_name}</span>
                </p>
              )}
              {profile.birth_date && (
                <p className="text-sm flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  {new Date(profile.birth_date).toLocaleDateString("pt-BR")}
                </p>
              )}
              {profile.phone && (
                <p className="text-sm flex items-center gap-2">
                  <Phone size={14} className="text-muted-foreground" />
                  {profile.phone}
                </p>
              )}
              {profile.emergency_contact && (
                <p className="text-sm flex items-center gap-2">
                  <AlertCircle size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Emergência:</span> {profile.emergency_contact}
                </p>
              )}
              {profile.medical_notes && (
                <div className="pt-2 border-t border-border mt-2">
                  <p className="text-sm flex items-start gap-2">
                    <FileText size={14} className="text-muted-foreground mt-0.5" />
                    <span>{profile.medical_notes}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Summary */}
      <section className="px-5 py-4">
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-primary">{vitals.length}</p>
              <p className="text-xs text-muted-foreground">Registros</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-foreground">
                {vitals.length > 0 
                  ? new Set(vitals.map(v => new Date(v.recorded_at).toDateString())).size 
                  : 0}
              </p>
              <p className="text-xs text-muted-foreground">Dias</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold text-success">
                {vitals.length > 0 
                  ? new Date(vitals[vitals.length - 1].recorded_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
                  : "-"}
              </p>
              <p className="text-xs text-muted-foreground">Último</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts */}
      <section className="px-5 space-y-4">
        {/* Blood Pressure */}
        {report?.include_blood_pressure && chartData.some(d => d.systolic || d.diastolic) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Gauge size={18} className="text-primary" />
                Pressão Arterial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[50, 180]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="systolic" name="Sistólica" stroke="hsl(var(--primary))" fill="url(#colorSys)" strokeWidth={2} connectNulls />
                    <Area type="monotone" dataKey="diastolic" name="Diastólica" stroke="hsl(var(--secondary))" fill="transparent" strokeWidth={2} connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Heart Rate */}
        {report?.include_heart_rate && chartData.some(d => d.heart_rate) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart size={18} className="text-red-500" />
                Frequência Cardíaca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[40, 140]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="heart_rate" name="BPM" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Temperature */}
        {report?.include_temperature && chartData.some(d => d.temperature) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Thermometer size={18} className="text-orange-500" />
                Temperatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[35, 40]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="temperature" name="°C" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Oxygen */}
        {report?.include_oxygen && chartData.some(d => d.oxygen_saturation) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Wind size={18} className="text-cyan-500" />
                Saturação O₂
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[85, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="oxygen_saturation" name="SpO₂ %" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weight */}
        {report?.include_weight && chartData.some(d => d.weight) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Scale size={18} className="text-purple-500" />
                Peso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="weight" name="kg" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pain Level */}
        {report?.include_pain && chartData.some(d => d.pain_level !== null && d.pain_level !== undefined) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity size={18} className="text-pink-500" />
                Nível de Dor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 10]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="pain_level" name="Dor" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Footer */}
      <footer className="px-5 py-8 text-center">
        <VigiDocLogo size="sm" showText={false} />
        <p className="text-xs text-muted-foreground mt-3">
          Relatório gerado pelo VigiDoc
        </p>
        <p className="text-xs text-muted-foreground">
          Monitoramento de sinais vitais para pacientes oncológicos
        </p>
      </footer>
    </div>
  );
};

export default Relatorio;
