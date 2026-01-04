import { useState } from "react";
import { X } from "lucide-react";

interface VitalInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string, value2?: string) => void;
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
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (value) {
      onSave(value, value2);
      setValue("");
      setValue2("");
      onClose();
    }
  };

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
        
        <h2 className="text-xl font-bold text-foreground mb-6">{title}</h2>
        
        <div className="space-y-4">
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
