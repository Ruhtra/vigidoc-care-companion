import { useState, useEffect, useRef } from "react";
import { Bell, Plus, Clock, Trash2, Check, BellRing, BellOff, Pill, Activity } from "lucide-react";
import VigiDocLogo from "@/components/VigiDocLogo";
import BottomNav from "@/components/BottomNav";
import { useReminders } from "@/hooks/useReminders";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const Lembretes = () => {
  const { user } = useAuth();
  const { reminders, loading, addReminder, toggleReminder, deleteReminder } = useReminders();
  const { permission, isSupported, requestPermission, showNotification, scheduleLocalNotification } = useNotifications();
  const { toast } = useToast();
  const scheduledNotificationsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const [showNewReminder, setShowNewReminder] = useState(false);
  const [newTime, setNewTime] = useState("09:00");
  const [newLabel, setNewLabel] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(DAYS);
  const [reminderType, setReminderType] = useState<"vital_collection" | "medication">("vital_collection");

  // Schedule notifications for enabled reminders
  useEffect(() => {
    if (permission !== "granted") return;

    // Clear existing scheduled notifications
    scheduledNotificationsRef.current.forEach((timeout) => clearTimeout(timeout));
    scheduledNotificationsRef.current.clear();

    const now = new Date();
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const currentDay = dayNames[now.getDay()];

    reminders
      .filter((r) => r.enabled && r.days.includes(currentDay))
      .forEach((reminder) => {
        const [hours, minutes] = reminder.time.split(":").map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        if (scheduledTime > now) {
          const timeoutId = scheduleLocalNotification(
            "VigiDoc - Lembrete",
            reminder.label,
            scheduledTime
          );
          if (timeoutId) {
            scheduledNotificationsRef.current.set(reminder.id, timeoutId);
          }
        }
      });

    return () => {
      scheduledNotificationsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, [reminders, permission, scheduleLocalNotification]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({
        title: "Notificações ativadas!",
        description: "Você receberá alertas nos horários configurados.",
      });
      // Test notification
      showNotification("VigiDoc", {
        body: "Notificações ativadas com sucesso! 🎉",
      });
    } else {
      toast({
        title: "Permissão negada",
        description: "Ative as notificações nas configurações do navegador.",
        variant: "destructive",
      });
    }
  };

  const handleAddReminder = async () => {
    if (!newLabel || selectedDays.length === 0) return;

    const success = await addReminder(newTime, newLabel, selectedDays, reminderType);
    
    if (success) {
      toast({
        title: "Lembrete criado!",
        description: `${newLabel} às ${newTime}`,
      });
      setNewLabel("");
      setNewTime("09:00");
      setSelectedDays(DAYS);
      setReminderType("vital_collection");
      setShowNewReminder(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case "medication":
        return <Pill className="text-primary" size={24} />;
      case "vital_collection":
      default:
        return <Activity className="text-primary" size={24} />;
    }
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

        <h1 className="text-2xl font-bold text-foreground">Lembretes</h1>
        <p className="text-muted-foreground mt-1">
          Configure seus horários de coleta e medicação
        </p>
      </header>

      {/* Notification Permission Card */}
      <section className="px-5 mb-6">
        {!isSupported ? (
          <div className="bg-muted rounded-2xl p-4 flex items-start gap-3">
            <BellOff className="text-muted-foreground flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-foreground font-medium">
                Notificações não suportadas
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Seu navegador não suporta notificações push. Tente usar o Chrome ou Safari.
              </p>
            </div>
          </div>
        ) : permission === "granted" ? (
          <div className="bg-success/10 border border-success/20 rounded-2xl p-4 flex items-start gap-3">
            <BellRing className="text-success flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-foreground font-medium">
                Notificações ativadas
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Você receberá alertas nos horários configurados.
              </p>
            </div>
          </div>
        ) : permission === "denied" ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3">
            <BellOff className="text-destructive flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-foreground font-medium">
                Notificações bloqueadas
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Para receber alertas, ative as notificações nas configurações do seu navegador.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-accent/50 border border-accent rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Bell className="text-primary flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium">
                  Ativar notificações
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Receba alertas para não esquecer de registrar seus sinais vitais.
                </p>
                <Button
                  onClick={handleEnableNotifications}
                  size="sm"
                  className="mt-3 gap-2"
                >
                  <BellRing size={16} />
                  Ativar notificações
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Login Banner (if not logged in) */}
      {!user && (
        <section className="px-5 mb-6">
          <Link to="/auth">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Faça login para sincronizar</p>
                <p className="text-xs text-muted-foreground">Seus lembretes serão salvos na nuvem</p>
              </div>
              <Button size="sm" variant="outline">
                Entrar
              </Button>
            </div>
          </Link>
        </section>
      )}

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
                    {getReminderIcon(reminder.reminder_type)}
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
              <div className="flex gap-1 mt-3 flex-wrap">
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
              {/* Reminder Type */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Tipo
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReminderType("vital_collection")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                      reminderType === "vital_collection"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Activity size={18} />
                    Coleta
                  </button>
                  <button
                    onClick={() => setReminderType("medication")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                      reminderType === "medication"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Pill size={18} />
                    Medicação
                  </button>
                </div>
              </div>

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
                  placeholder={
                    reminderType === "medication"
                      ? "Ex: Tomar remédio X"
                      : "Ex: Coleta da manhã"
                  }
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
                  onClick={handleAddReminder}
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
