import { useState, useEffect } from "react";
import { Download, Smartphone, Share, MoreVertical, Plus, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import VigiDocLogo from "@/components/VigiDocLogo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Instalar = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Instalar VigiDoc</h1>
      </div>

      {/* Logo */}
      <div className="flex justify-center mb-8 animate-fade-in">
        <VigiDocLogo size="lg" />
      </div>

      {isInstalled ? (
        <Card className="border-success/20 bg-success/5 animate-fade-in">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              App Instalado!
            </h2>
            <p className="text-muted-foreground">
              O VigiDoc já está instalado no seu dispositivo. Você pode acessá-lo
              pela tela inicial.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="mt-6 btn-primary w-full"
            >
              Voltar ao App
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Install Button (Android/Desktop) */}
          {deferredPrompt && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Instalar Agora
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Adicione o VigiDoc à sua tela inicial para acesso rápido.
                  </p>
                  <Button
                    onClick={handleInstallClick}
                    className="btn-primary w-full"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Instalar VigiDoc
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* iOS Instructions */}
          {isIOS && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Como instalar no iPhone/iPad
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Siga os passos abaixo
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-xl">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Toque no ícone de Compartilhar
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <Share className="h-5 w-5" />
                        <span className="text-sm">
                          Na barra inferior do Safari
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-xl">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Role para baixo e toque em
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <Plus className="h-5 w-5" />
                        <span className="text-sm">
                          "Adicionar à Tela de Início"
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-xl">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Confirme tocando em "Adicionar"
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        O VigiDoc aparecerá na sua tela inicial
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Android Instructions (when no prompt available) */}
          {isAndroid && !deferredPrompt && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Como instalar no Android
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Siga os passos abaixo
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-xl">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Toque no menu do navegador
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <MoreVertical className="h-5 w-5" />
                        <span className="text-sm">
                          Os três pontos no canto superior
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-xl">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Selecione "Instalar app" ou
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <Download className="h-5 w-5" />
                        <span className="text-sm">
                          "Adicionar à tela inicial"
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-xl">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Confirme a instalação
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        O VigiDoc será instalado no seu dispositivo
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Desktop Instructions */}
          {!isIOS && !isAndroid && !deferredPrompt && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Acesse pelo Celular
                  </h2>
                  <p className="text-muted-foreground">
                    Para a melhor experiência, acesse este site pelo navegador
                    do seu smartphone e siga as instruções de instalação.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground mb-4">
                Vantagens do App Instalado
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Check className="h-5 w-5 text-success shrink-0" />
                  <span>Acesso rápido pela tela inicial</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Check className="h-5 w-5 text-success shrink-0" />
                  <span>Funciona mesmo sem internet</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Check className="h-5 w-5 text-success shrink-0" />
                  <span>Experiência como app nativo</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Check className="h-5 w-5 text-success shrink-0" />
                  <span>Notificações de lembretes</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Instalar;
