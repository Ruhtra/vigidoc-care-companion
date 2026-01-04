import { ReactNode } from "react";

interface VitalCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  unit: string;
  status?: "normal" | "warning" | "alert";
  onClick?: () => void;
}

const VitalCard = ({ icon, label, value, unit, status = "normal", onClick }: VitalCardProps) => {
  const statusStyles = {
    normal: "border-primary/30 bg-primary/5",
    warning: "border-warning/30 bg-warning/5",
    alert: "border-destructive/30 bg-destructive/5",
  };

  const statusDotStyles = {
    normal: "bg-primary",
    warning: "bg-warning",
    alert: "bg-destructive animate-pulse-soft",
  };

  return (
    <button
      onClick={onClick}
      className={`vital-card w-full text-left border-2 ${statusStyles[status]} cursor-pointer group`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${statusDotStyles[status]}`} />
      </div>
      <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">{value || "--"}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </button>
  );
};

export default VitalCard;
