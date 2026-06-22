import { usePage } from "@inertiajs/react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useState, useEffect } from "react";

interface FlashMessages {
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
}

export const FlashMessages = () => {
  const { flash } = usePage().props as { flash?: FlashMessages };
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (flash) {
      const newVisible: Record<string, boolean> = {};
      Object.keys(flash).forEach((key) => {
        if (flash[key as keyof FlashMessages]) {
          newVisible[key] = true;
        }
      });
      setVisible(newVisible);

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setVisible({});
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [flash]);

  if (!flash) return null;

  // Base sólida (bg-card + text-foreground) com filete lateral colorido por tipo.
  // Dark-safe e alto-contraste-safe: o card segue o tema e o filete dá a semântica.
  const configs = {
    success: {
      icon: CheckCircle,
      box: "border-l-4 border-l-emerald-500",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    error: {
      icon: XCircle,
      box: "border-l-4 border-l-destructive",
      iconColor: "text-destructive",
    },
    warning: {
      icon: AlertTriangle,
      box: "border-l-4 border-l-amber-500",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    info: {
      icon: Info,
      box: "border-l-4 border-l-sky",
      iconColor: "text-sky",
    },
  };

  return (
    <div className="fixed left-3 right-3 top-3 z-50 space-y-2 sm:left-auto sm:right-4 sm:top-4 sm:max-w-md">
      {Object.entries(flash).map(([type, message]) => {
        if (!message || !visible[type]) return null;
        const config = configs[type as keyof typeof configs];
        if (!config) return null;
        const Icon = config.icon;
        const assertive = type === "error" || type === "warning";

        return (
          <div
            key={type}
            role={assertive ? "alert" : "status"}
            aria-live={assertive ? "assertive" : "polite"}
            className={`flex items-start gap-3 p-4 rounded-lg border bg-card text-foreground ${config.box} shadow-lg animate-fade-in`}
          >
            <Icon className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} aria-hidden="true" />
            <p className="flex-1 text-sm">{message}</p>
            <button
              type="button"
              aria-label="Fechar aviso"
              onClick={() => setVisible((prev) => ({ ...prev, [type]: false }))}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
