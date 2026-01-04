import { useState } from "react";
import { X, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VitalInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string, value2?: string, time?: string) => void;
  title: string;
  label: string;
  label2?: string;
  unit: string;
  unit2?: string;
  placeholder?: string;
  placeholder2?: string;
  type?: "number" | "text";
}

const VitalInputModal = ({
  isOpen,
  onClose,
  onSave,
  title,
  label,
  label2,
  unit,
  unit2,
  placeholder = "",
  placeholder2 = "",
  type = "number",
}: VitalInputModalProps) => {
  const now = new Date();
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");
  const [time, setTime] = useState(format(now, "HH:mm"));

  if (!isOpen) return null;

  const handleSave = () => {
    if (value) {
      onSave(value, value2, time);
      setValue("");
      setValue2("");
      setTime(format(new Date(), "HH:mm"));
      onClose();
    }
  };

  const formattedDate = format(now, "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-2xl p-6 animate-slide-up shadow-soft">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X size={20} className="text-muted-foreground" />
        </button>
        
        <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground capitalize mb-6">{formattedDate}</p>
        
        <div className="space-y-4">
          {/* Campo de hora */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Horário da medição
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="vital-input flex-1 pl-10 w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {label}
            </label>
            <div className="flex items-center gap-3">
              <input
                type={type}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="vital-input flex-1"
                autoFocus
              />
              <span className="text-muted-foreground font-medium min-w-[50px]">{unit}</span>
            </div>
          </div>
          
          {label2 && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {label2}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type={type}
                  value={value2}
                  onChange={(e) => setValue2(e.target.value)}
                  placeholder={placeholder2}
                  className="vital-input flex-1"
                />
                <span className="text-muted-foreground font-medium min-w-[50px]">{unit2}</span>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={handleSave}
          disabled={!value}
          className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Salvar
        </button>
      </div>
    </div>
  );
};

export default VitalInputModal;
