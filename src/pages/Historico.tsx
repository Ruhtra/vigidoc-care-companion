import { useState } from "react";
import { Download, Calendar } from "lucide-react";
import VigiDocLogo from "@/components/VigiDocLogo";
import BottomNav from "@/components/BottomNav";
import { useVitals } from "@/hooks/useVitals";

const Historico = () => {
  const { vitals, loading } = useVitals();
  const [filter, setFilter] = useState<"week" | "month" | "all">("week");

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
    .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());

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
        <div className="flex justify-end mb-4">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
          >
            <Download size={18} />
            Exportar
          </button>
        </div>

        <h1 className="text-2xl font-bold text-foreground">Histórico</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe seus registros de sinais vitais
        </p>
      </header>

      {/* Filter */}
      <section className="px-5 mb-4">
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
      </section>

      {/* Table */}
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
        ) : (
          <div className="bg-card rounded-2xl overflow-hidden shadow-card">
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
                  {filteredVitals.map((vital, index) => (
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
