import { useEffect, useState } from "react";

export interface CssHslTheme {
  navy: string;
  gold: string;
  border: string;
  muted: string;
  foreground: string;
  card: string;
  isDark: boolean;
}

const FALLBACK: CssHslTheme = {
  navy: "hsl(207 78% 21%)",
  gold: "hsl(45 93% 47%)",
  border: "hsl(210 25% 88%)",
  muted: "hsl(212 20% 45%)",
  foreground: "hsl(212 45% 15%)",
  card: "hsl(0 0% 100%)",
  isDark: false,
};

function readCssHsl(): CssHslTheme {
  if (typeof document === "undefined") return FALLBACK;
  const root = document.documentElement;
  const get = (name: string, fb: string) => {
    const raw = getComputedStyle(root).getPropertyValue(name).trim();
    return raw ? `hsl(${raw})` : fb;
  };
  return {
    navy: get("--navy", FALLBACK.navy),
    gold: get("--gold", FALLBACK.gold),
    border: get("--border", FALLBACK.border),
    muted: get("--muted-foreground", FALLBACK.muted),
    foreground: get("--foreground", FALLBACK.foreground),
    card: get("--card", FALLBACK.card),
    isDark: root.classList.contains("dark"),
  };
}

/** Lê tokens HSL do :root (atualiza com dark mode / tema dinâmico). */
export function useCssHsl(): CssHslTheme {
  const [theme, setTheme] = useState<CssHslTheme>(FALLBACK);

  useEffect(() => {
    const sync = () => setTheme(readCssHsl());
    sync();

    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-layout", "data-template"],
    });
    window.addEventListener("resize", sync);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return theme;
}
