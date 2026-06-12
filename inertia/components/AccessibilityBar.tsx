import { useCallback, useEffect, useState } from "react";
import { Sun, Moon, Contrast, Type, Accessibility } from "lucide-react";

declare global {
  interface Window {
    VLibras?: { Widget: new (url: string) => unknown };
    __vlibrasWidget?: unknown;
  }
}

/* ===== Persistência (localStorage) =====
 * theme: 'dark' | 'light'  -> classe .dark no <html>
 * contrast: 'high' | 'normal' -> classe .high-contrast no <html>
 * fontScale: '1' | '2' | '3' -> atributo data-font-scale no <html>
 * vlibras: 'on' | 'off' -> widget VLibras (carregado sob demanda)
 * O script inline no inertia_layout.edge reaplica tudo antes do primeiro paint.
 */

function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage indisponível (modo privado etc.) — segue sem persistir */
  }
}

function notifyChange() {
  window.dispatchEvent(new Event("a11y:changed"));
}

/** Estado do modo escuro sincronizado com a classe .dark do <html>.
 *  Compartilhado entre a AccessibilityBar e o toggle do header compacto. */
export function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    window.addEventListener("a11y:changed", sync);
    return () => window.removeEventListener("a11y:changed", sync);
  }, []);

  const toggle = useCallback(() => {
    const el = document.documentElement;
    const next = !el.classList.contains("dark");
    el.classList.toggle("dark", next);
    persist("theme", next ? "dark" : "light");
    notifyChange();
  }, []);

  return [dark, toggle];
}

/* ===== VLibras (carregamento lazy) ===== */

const VLIBRAS_SCRIPT_URL = "https://vlibras.gov.br/app/vlibras-plugin.js";
const VLIBRAS_APP_URL = "https://vlibras.gov.br/app";

let vlibrasScriptPromise: Promise<void> | null = null;

function loadVLibrasScript(): Promise<void> {
  if (typeof window !== "undefined" && window.VLibras) return Promise.resolve();
  if (vlibrasScriptPromise) return vlibrasScriptPromise;

  vlibrasScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = VLIBRAS_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      vlibrasScriptPromise = null;
      script.remove();
      reject(new Error("Falha ao carregar o VLibras"));
    };
    document.body.appendChild(script);
  });

  return vlibrasScriptPromise;
}

function setVLibrasVisible(visible: boolean) {
  const container = document.querySelector<HTMLElement>("[vw]");
  if (container) container.style.display = visible ? "" : "none";
}

async function activateVLibras(): Promise<void> {
  await loadVLibrasScript();
  if (!window.__vlibrasWidget && window.VLibras) {
    window.__vlibrasWidget = new window.VLibras.Widget(VLIBRAS_APP_URL);
  }
  setVLibrasVisible(true);
}

/* ===== Barra de acessibilidade ===== */

const MIN_SCALE = 1;
const MAX_SCALE = 3;

export const AccessibilityBar = () => {
  const [dark, toggleDark] = useDarkMode();
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState(MIN_SCALE);
  const [vlibrasOn, setVlibrasOn] = useState(false);
  const [vlibrasLoading, setVlibrasLoading] = useState(false);

  // Sincroniza o estado inicial com o que o script anti-flash já aplicou no <html>
  useEffect(() => {
    const el = document.documentElement;
    setHighContrast(el.classList.contains("high-contrast"));

    const rawScale = Number.parseInt(el.getAttribute("data-font-scale") || "1", 10);
    setFontScale(rawScale >= MIN_SCALE && rawScale <= MAX_SCALE ? rawScale : MIN_SCALE);

    let saved: string | null = null;
    try {
      saved = localStorage.getItem("vlibras");
    } catch {
      saved = null;
    }
    if (saved === "on") {
      setVlibrasOn(true);
      activateVLibras().catch(() => setVlibrasOn(false));
    }
  }, []);

  const applyFontScale = useCallback((scale: number) => {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
    const el = document.documentElement;
    if (clamped === MIN_SCALE) {
      el.removeAttribute("data-font-scale");
    } else {
      el.setAttribute("data-font-scale", String(clamped));
    }
    persist("fontScale", String(clamped));
    setFontScale(clamped);
  }, []);

  const toggleContrast = useCallback(() => {
    const el = document.documentElement;
    const next = !el.classList.contains("high-contrast");
    el.classList.toggle("high-contrast", next);
    persist("contrast", next ? "high" : "normal");
    setHighContrast(next);
    notifyChange();
  }, []);

  const toggleVLibras = useCallback(async () => {
    if (vlibrasOn) {
      setVLibrasVisible(false);
      persist("vlibras", "off");
      setVlibrasOn(false);
      return;
    }
    setVlibrasLoading(true);
    try {
      await activateVLibras();
      persist("vlibras", "on");
      setVlibrasOn(true);
    } catch {
      // rede indisponível ou bloqueada — mantém desativado
    } finally {
      setVlibrasLoading(false);
    }
  }, [vlibrasOn]);

  const btnBase =
    "inline-flex items-center justify-center gap-1 h-7 min-w-[1.75rem] px-1.5 rounded-md text-xs font-semibold transition-colors hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed";
  const btnActive = "bg-gold text-navy-dark hover:bg-gold-light";

  return (
    <div className="relative z-[70] bg-navy-dark text-white border-b border-white/10">
      <div className="container mx-auto px-4 py-1 flex items-center gap-2 text-xs">
        <span className="hidden sm:flex items-center gap-1.5 font-medium tracking-wide text-white/70">
          <Accessibility className="w-3.5 h-3.5" aria-hidden="true" />
          Acessibilidade
        </span>

        <div
          role="group"
          aria-label="Opções de acessibilidade"
          className="flex flex-wrap items-center gap-1 ml-auto"
        >
          {/* Escala de fonte */}
          <Type className="w-3.5 h-3.5 text-white/50 mr-0.5" aria-hidden="true" />
          <button
            type="button"
            onClick={() => applyFontScale(fontScale - 1)}
            disabled={fontScale <= MIN_SCALE}
            aria-label="Diminuir tamanho do texto"
            className={btnBase}
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => applyFontScale(MIN_SCALE)}
            aria-label="Tamanho de texto padrão"
            className={btnBase}
          >
            A
          </button>
          <button
            type="button"
            onClick={() => applyFontScale(fontScale + 1)}
            disabled={fontScale >= MAX_SCALE}
            aria-label="Aumentar tamanho do texto"
            className={btnBase}
          >
            A+
          </button>

          <span className="w-px h-4 bg-white/20 mx-1" aria-hidden="true" />

          {/* Alto contraste */}
          <button
            type="button"
            onClick={toggleContrast}
            aria-pressed={highContrast}
            aria-label={highContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
            title="Alto contraste"
            className={`${btnBase} ${highContrast ? btnActive : ""}`}
          >
            <Contrast className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden md:inline">Contraste</span>
          </button>

          {/* Modo escuro */}
          <button
            type="button"
            onClick={toggleDark}
            aria-pressed={dark}
            aria-label={dark ? "Desativar modo escuro" : "Ativar modo escuro"}
            title="Modo escuro"
            className={`${btnBase} ${dark ? btnActive : ""}`}
          >
            {dark ? (
              <Sun className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Moon className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span className="hidden md:inline">{dark ? "Modo claro" : "Modo escuro"}</span>
          </button>

          <span className="w-px h-4 bg-white/20 mx-1" aria-hidden="true" />

          {/* VLibras */}
          <button
            type="button"
            onClick={() => void toggleVLibras()}
            aria-pressed={vlibrasOn}
            aria-label={
              vlibrasOn
                ? "Desativar VLibras (tradução para Língua Brasileira de Sinais)"
                : "Ativar VLibras (tradução para Língua Brasileira de Sinais)"
            }
            title="VLibras - Língua Brasileira de Sinais"
            disabled={vlibrasLoading}
            className={`${btnBase} ${vlibrasOn ? btnActive : ""}`}
          >
            <Accessibility className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden md:inline">{vlibrasLoading ? "Carregando…" : "VLibras"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
