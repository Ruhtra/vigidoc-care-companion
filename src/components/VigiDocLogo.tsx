import vigiDocLogo from "@/assets/vigidoc-logo.png";

interface VigiDocLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const VigiDocLogo = ({
  size = "md",
  showText = true
}: VigiDocLogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-20"
  };

  return (
    <div className="flex items-center gap-2">
      <img 
        src={vigiDocLogo} 
        alt="VigiDoc - Sinais Vitais" 
        className={`${sizeClasses[size]} w-auto`}
      />
      {showText && size !== "sm" && (
        <div className="flex flex-col leading-tight">
          <span className="text-xs text-muted-foreground font-medium">
            Registro e acompanhamento dos seus sinais vitais
          </span>
        </div>
      )}
    </div>
  );
};

export default VigiDocLogo;
