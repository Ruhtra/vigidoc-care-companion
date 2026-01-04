import { useState } from "react";
import { Heart, Thermometer, Wind, Scale, Activity, Gauge } from "lucide-react";
import VigiDocLogo from "@/components/VigiDocLogo";
import VitalCard from "@/components/VitalCard";
import VitalInputModal from "@/components/VitalInputModal";
import BottomNav from "@/components/BottomNav";
import { useVitals } from "@/hooks/useVitals";
type ModalType = "bloodPressure" | "heartRate" | "temperature" | "oxygenSaturation" | "weight" | "painLevel" | null;
const Index = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const {
    todayVitals,
    saveVital,
    getStatus
  } = useVitals();
  const today = new Date();
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
  const handleSave = (value: string, value2?: string) => {
    if (activeModal === "bloodPressure" && value2) {
      saveVital("bloodPressure", value, Number(value2));
    } else if (activeModal) {
      saveVital(activeModal, value);
    }
  };
  const vitalCards = [{
    key: "bloodPressure" as ModalType,
    icon: <Gauge size={24} />,
    label: "Pressão Arterial",
    value: todayVitals.systolic && todayVitals.diastolic ? `${todayVitals.systolic}/${todayVitals.diastolic}` : "",
    unit: "mmHg",
    status: getStatus("systolic", todayVitals.systolic)
  }, {
    key: "heartRate" as ModalType,
    icon: <Heart size={24} />,
    label: "Frequência Cardíaca",
    value: todayVitals.heartRate?.toString() || "",
    unit: "bpm",
    status: getStatus("heartRate", todayVitals.heartRate)
  }, {
    key: "temperature" as ModalType,
    icon: <Thermometer size={24} />,
    label: "Temperatura",
    value: todayVitals.temperature?.toString() || "",
    unit: "°C",
    status: getStatus("temperature", todayVitals.temperature)
  }, {
    key: "oxygenSaturation" as ModalType,
    icon: <Wind size={24} />,
    label: "Saturação O₂",
    value: todayVitals.oxygenSaturation?.toString() || "",
    unit: "%",
    status: getStatus("oxygenSaturation", todayVitals.oxygenSaturation)
  }, {
    key: "weight" as ModalType,
    icon: <Scale size={24} />,
    label: "Peso",
    value: todayVitals.weight?.toString() || "",
    unit: "kg",
    status: "normal" as const
  }, {
    key: "painLevel" as ModalType,
    icon: <Activity size={24} />,
    label: "Nível de Dor",
    value: todayVitals.painLevel?.toString() || "",
    unit: "/10",
    status: getStatus("painLevel", todayVitals.painLevel)
  }];
  const modalConfigs: Record<Exclude<ModalType, null>, {
    title: string;
    label: string;
    label2?: string;
    unit: string;
    unit2?: string;
    placeholder: string;
    placeholder2?: string;
  }> = {
    bloodPressure: {
      title: "Pressão Arterial",
      label: "Sistólica (máxima)",
      label2: "Diastólica (mínima)",
      unit: "mmHg",
      unit2: "mmHg",
      placeholder: "120",
      placeholder2: "80"
    },
    heartRate: {
      title: "Frequência Cardíaca",
      label: "Batimentos por minuto",
      unit: "bpm",
      placeholder: "72"
    },
    temperature: {
      title: "Temperatura",
      label: "Temperatura corporal",
      unit: "°C",
      placeholder: "36.5"
    },
    oxygenSaturation: {
      title: "Saturação de Oxigênio",
      label: "SpO₂",
      unit: "%",
      placeholder: "98"
    },
    weight: {
      title: "Peso",
      label: "Peso atual",
      unit: "kg",
      placeholder: "70"
    },
    painLevel: {
      title: "Nível de Dor",
      label: "Intensidade (0 = sem dor)",
      unit: "/10",
      placeholder: "0"
    }
  };
  return <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-5 pt-8 pb-6">
        <div className="flex items-center justify-center mb-8">
          <VigiDocLogo size="lg" />
        </div>
        
        <div className="animate-fade-in text-center">
          <p className="text-muted-foreground text-sm font-medium capitalize">
            {dateFormatter.format(today)}
          </p>
          <h1 className="text-2xl font-bold text-foreground mt-2">Olá, João!</h1>
          <p className="text-muted-foreground mt-1">Registre seus sinais vitais</p>
        </div>
      </header>

      {/* Quick Actions */}
      <section className="px-5 mb-6">
        <div className="bg-primary rounded-2xl p-5 text-primary-foreground shadow-button">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 text-sm font-medium">
                Coleta do dia
              </p>
              <p className="text-xl font-bold mt-1">
                {Object.keys(todayVitals).filter(k => k !== 'id' && k !== 'date').length} de 6 registros
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Activity size={28} />
            </div>
          </div>
          <div className="mt-4 h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary-foreground rounded-full transition-all duration-500" style={{
            width: `${Object.keys(todayVitals).filter(k => k !== 'id' && k !== 'date').length / 6 * 100}%`
          }} />
          </div>
        </div>
      </section>

      {/* Vital Signs Grid */}
      <section className="px-5">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Sinais Vitais
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {vitalCards.map((card, index) => <div key={card.key} className="animate-slide-up" style={{
          animationDelay: `${index * 0.1}s`
        }}>
              <VitalCard icon={card.icon} label={card.label} value={card.value} unit={card.unit} status={card.status} onClick={() => setActiveModal(card.key)} />
            </div>)}
        </div>
      </section>

      {/* Modals */}
      {activeModal && <VitalInputModal isOpen={true} onClose={() => setActiveModal(null)} onSave={handleSave} {...modalConfigs[activeModal]} />}

      <BottomNav />
    </div>;
};
export default Index;