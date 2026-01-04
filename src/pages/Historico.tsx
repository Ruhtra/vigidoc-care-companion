import { useState } from "react";
import { Download, Calendar, BarChart3, Table } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Area, AreaChart 
} from "recharts";
import VigiDocLogo from "@/components/VigiDocLogo";
import BottomNav from "@/components/BottomNav";
import { useVitals } from "@/hooks/useVitals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Historico = () => {
  const { vitals, loading } = useVitals();
  const [filter, setFilter] = useState<"week" | "month" | "all">("week");
  const [viewMode, setViewMode] = useState<"charts" | "table">("charts");

  const filteredVitals = vitals
    .filter((v) => {
      const now = new Date();
      const vitalDate = new Date(v.recorded_at);
      if (filter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return vitalDate >= weekAgo;
      }
      if (filter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return vitalDate >= monthAgo;
      }
      return true;
    })
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

  const chartData = filteredVitals.map((v) => ({
    date: new Date(v.recorded_at).toLocaleDateString("pt-BR", { 
      day: "2-digit", 
      month: "2-digit" 
    }),
    fullDate: v.recorded_at,
    systolic: v.systolic,
    diastolic: v.diastolic,
    heart_rate: v.heart_rate,
    temperature: v.temperature,
    oxygen_saturation: v.oxygen_saturation,
    weight: v.weight,
    pain_level: v.pain_level,
  }));

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(new Date(dateStr));
  };

  const exportToCSV = () => {
    const headers = [
      "Data",
      "Pressão Sistólica",
      "Pressão Diastólica",
      "Freq. Cardíaca",
      "Temperatura",
      "Saturação O2",
      "Peso",
      "Nível de Dor",
    ];

    const rows = vitals.map((v) => [
      formatDate(v.recorded_at),
      v.systolic || "",
      v.diastolic || "",
      v.heart_rate || "",
      v.temperature || "",
      v.oxygen_saturation || "",
      v.weight || "",
      v.pain_level || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `vigidoc_historico_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const hasBloodPressureData = chartData.some(d => d.systolic || d.diastolic);
  const hasHeartRateData = chartData.some(d => d.heart_rate);
  const hasTemperatureData = chartData.some(d => d.temperature);
  const hasOxygenData = chartData.some(d => d.oxygen_saturation);
  const hasWeightData = chartData.some(d => d.weight);
  const hasPainData = chartData.some(d => d.pain_level !== null && d.pain_level !== undefined);

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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe sua evolução
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
          >
            <Download size={18} />
            Exportar
          </button>
        </div>
      </header>

      {/* Filters and View Toggle */}
      <section className="px-5 mb-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-2">
            {[
              { key: "week", label: "7 dias" },
              { key: "month", label: "30 dias" },
              { key: "all", label: "Todos" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as typeof filter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === item.key
                    ? "bg-primary text-primary-foreground shadow-button"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode("charts")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "charts" 
                  ? "bg-card text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart3 size={18} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "table" 
                  ? "bg-card text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Table size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-5">
        {filteredVitals.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              Nenhum registro encontrado
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Comece a registrar seus sinais vitais
            </p>
          </div>
        ) : viewMode === "charts" ? (
          <div className="space-y-4">
            {/* Blood Pressure Chart */}
            {hasBloodPressureData && (
              <Card className="animate-fade-in">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-foreground">
                    Pressão Arterial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorSystolic" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorDiastolic" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11 }} 
                          className="text-muted-foreground"
                        />
                        <YAxis 
                          tick={{ fontSize: 11 }} 
                          domain={[50, 180]}
                          className="text-muted-foreground"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="systolic" 
                          name="Sistólica" 
                          stroke="hsl(var(--primary))" 
                          fill="url(#colorSystolic)"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
                          connectNulls
                        />
                        <Area 
                          type="monotone" 
                          dataKey="diastolic" 
                          name="Diastólica" 
                          stroke="hsl(var(--secondary))" 
                          fill="url(#colorDiastolic)"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--secondary))", strokeWidth: 0, r: 3 }}
                          connectNulls
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Heart Rate Chart */}
            {hasHeartRateData && (
              <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-foreground">
                    Frequência Cardíaca
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={[40, 140]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="heart_rate" 
                          name="BPM" 
                          stroke="#ef4444"
                          fill="url(#colorHeart)"
                          strokeWidth={2}
                          dot={{ fill: "#ef4444", strokeWidth: 0, r: 3 }}
                          connectNulls
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Temperature & Oxygen in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hasTemperatureData && (
                <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-foreground">
                      Temperatura
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} domain={[35, 40]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="temperature" 
                            name="°C" 
                            stroke="#f97316"
                            strokeWidth={2}
                            dot={{ fill: "#f97316", strokeWidth: 0, r: 3 }}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {hasOxygenData && (
                <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-foreground">
                      Saturação O₂
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} domain={[85, 100]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="oxygen_saturation" 
                            name="SpO₂ %" 
                            stroke="#06b6d4"
                            strokeWidth={2}
                            dot={{ fill: "#06b6d4", strokeWidth: 0, r: 3 }}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Weight & Pain Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hasWeightData && (
                <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-foreground">
                      Peso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="weight" 
                            name="kg" 
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 3 }}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {hasPainData && (
                <Card className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-foreground">
                      Nível de Dor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} domain={[0, 10]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line 
                            type="monotone" 
                            dataKey="pain_level" 
                            name="Dor" 
                            stroke="#ec4899"
                            strokeWidth={2}
                            dot={{ fill: "#ec4899", strokeWidth: 0, r: 3 }}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="bg-card rounded-2xl overflow-hidden shadow-card animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      PA
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      FC
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Temp
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      SpO₂
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Peso
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Dor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredVitals].reverse().map((vital, index) => (
                    <tr
                      key={vital.id}
                      className={`border-b border-border/50 ${
                        index % 2 === 0 ? "bg-muted/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">
                        {formatDate(vital.recorded_at)}
                      </td>
                      <td className="px-3 py-3 text-sm text-center text-foreground">
                        {vital.systolic && vital.diastolic
                          ? `${vital.systolic}/${vital.diastolic}`
                          : "-"}
                      </td>
                      <td className="px-3 py-3 text-sm text-center text-foreground">
                        {vital.heart_rate || "-"}
                      </td>
                      <td className="px-3 py-3 text-sm text-center text-foreground">
                        {vital.temperature || "-"}
                      </td>
                      <td className="px-3 py-3 text-sm text-center text-foreground">
                        {vital.oxygen_saturation || "-"}
                      </td>
                      <td className="px-3 py-3 text-sm text-center text-foreground">
                        {vital.weight || "-"}
                      </td>
                      <td className="px-3 py-3 text-sm text-center text-foreground">
                        {vital.pain_level !== undefined && vital.pain_level !== null ? vital.pain_level : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
};

export default Historico;
