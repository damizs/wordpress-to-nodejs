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

  const configs = {
    success: { icon: CheckCircle, bg: "bg-green-50", border: "border-green-200", text: "text-green-800", iconColor: "text-green-500" },
    error: { icon: XCircle, bg: "bg-red-50", border: "border-red-200", text: "text-red-800", iconColor: "text-red-500" },
    warning: { icon: AlertTriangle, bg: "bg-yellow-100", border: "border-yellow-200", text: "text-yellow-800", iconColor: "text-yellow-500" },
    info: { icon: Info, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", iconColor: "text-blue-500" },
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {Object.entries(flash).map(([type, message]) => {
        if (!message || !visible[type]) return null;
        const config = configs[type as keyof typeof configs];
        if (!config) return null;
        const Icon = config.icon;

        return (
          <div
            key={type}
            className={`flex items-start gap-3 p-4 rounded-lg border ${config.bg} ${config.border} ${config.text} shadow-lg animate-fade-in`}
          >
            <Icon className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} />
            <p className="flex-1 text-sm">{message}</p>
            <button
              onClick={() => setVisible((prev) => ({ ...prev, [type]: false }))}
              className="shrink-0 hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
