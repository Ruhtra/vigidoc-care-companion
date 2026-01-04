import { useState } from "react";
import { Bell, Plus, Clock, Trash2, Check } from "lucide-react";
import VigiDocLogo from "@/components/VigiDocLogo";
import BottomNav from "@/components/BottomNav";

interface Reminder {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
  days: string[];
}

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const Lembretes = () => {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      time: "08:00",
      label: "Coleta da manhã",
      enabled: true,
      days: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    },
    {
      id: "2",
      time: "14:00",
      label: "Coleta da tarde",
      enabled: true,
      days: ["Seg", "Ter", "Qua", "Qui", "Sex"],
    },
    {
      id: "3",
      time: "20:00",
      label: "Coleta da noite",
      enabled: false,
      days: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    },
  ]);

  const [showNewReminder, setShowNewReminder] = useState(false);
  const [newTime, setNewTime] = useState("09:00");
  const [newLabel, setNewLabel] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(DAYS);

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const addReminder = () => {
    if (!newLabel || selectedDays.length === 0) return;

    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      time: newTime,
      label: newLabel,
      enabled: true,
      days: selectedDays,
    };

    setReminders((prev) => [...prev, newReminder]);
    setNewLabel("");
    setNewTime("09:00");
    setSelectedDays(DAYS);
    setShowNewReminder(false);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <VigiDocLogo size="sm" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">Lembretes</h1>
        <p className="text-muted-foreground mt-1">
          Configure seus horários de coleta
        </p>
      </header>

      {/* Info Card */}
      <section className="px-5 mb-6">
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 flex items-start gap-3">
          <Bell className="text-accent flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm text-foreground font-medium">
              Notificações Push
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Para receber alertas, conecte o backend do aplicativo. Os lembretes
              serão enviados nos horários configurados.
            </p>
          </div>
        </div>
      </section>

      {/* Reminders List */}
      <section className="px-5">
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`bg-card rounded-2xl p-4 shadow-card transition-all ${
                !reminder.enabled ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {reminder.time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {reminder.label}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    className={`w-12 h-7 rounded-full transition-all ${
                      reminder.enabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-card shadow-sm transition-all ${
                        reminder.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex gap-1 mt-3">
                {DAYS.map((day) => (
                  <span
                    key={day}
                    className={`text-xs px-2 py-1 rounded-md font-medium ${
                      reminder.days.includes(day)
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Reminder */}
        {!showNewReminder ? (
          <button
            onClick={() => setShowNewReminder(true)}
            className="w-full mt-4 p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus size={20} />
            <span className="font-medium">Adicionar lembrete</span>
          </button>
        ) : (
          <div className="mt-4 bg-card rounded-2xl p-4 shadow-card animate-slide-up">
            <h3 className="font-semibold text-foreground mb-4">
              Novo Lembrete
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Horário
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="vital-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Ex: Coleta da manhã"
                  className="vital-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Dias da semana
                </label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDays.includes(day)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowNewReminder(false)}
                  className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium hover:bg-muted/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addReminder}
                  disabled={!newLabel || selectedDays.length === 0}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
};

export default Lembretes;
