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
    sm: "h-10",
    md: "h-14",
    lg: "h-24"
  };
  return <div className="flex items-center justify-center gap-3">
      
    </div>;
};
export default VigiDocLogo;