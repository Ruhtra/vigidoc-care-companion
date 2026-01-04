import { Activity } from "lucide-react";
interface VigiDocLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}
const VigiDocLogo = ({
  size = "md",
  showText = true
}: VigiDocLogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14"
  };
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl"
  };
  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 30
  };
  return <div className="flex items-center gap-2">
      <div className="">
        <Activity className="text-primary-foreground" size={iconSizes[size]} />
      </div>
      {showText && <div className="flex flex-col leading-tight">
          <span className={`${textSizes[size]} font-bold gradient-text`}>
            VigiDoc
          </span>
          {size !== "sm" && <span className="text-xs text-muted-foreground font-medium">
              Monitoramento de Saúde
            </span>}
        </div>}
    </div>;
};
export default VigiDocLogo;