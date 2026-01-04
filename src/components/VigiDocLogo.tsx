import vigiDocLogo from "@/assets/vigidoc-logo.png";

interface VigiDocLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const VigiDocLogo = ({
  size = "md",
  showText = true
}: VigiDocLogoProps) => {
  const sizeConfig = {
    sm: { className: "h-10", width: 40, height: 40 },
    md: { className: "h-14", width: 56, height: 56 },
    lg: { className: "h-24", width: 96, height: 96 }
  };

  const { className, width, height } = sizeConfig[size];

  return (
    <div className="flex items-center justify-center gap-3 animate-fade-in">
      <img 
        src={vigiDocLogo} 
        alt="VigiDoc - Sinais Vitais" 
        className={`${className} w-auto object-contain`}
        width={width}
        height={height}
        fetchPriority="high"
      />
    </div>
  );
};

export default VigiDocLogo;
