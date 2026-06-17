import { useCallback, useEffect, useRef, useState } from "react";
import { Sun, Moon, Contrast, Type, Accessibility, PersonStanding, X } from "lucide-react";

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

const VLIBRAS_SCRIPT_URL =
  "https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-portal@sgd/app/vlibras-plugin.js?v=20260510";
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

/* ===== Acessibilidade (FAB + painel popover) =====
 * Botão flutuante circular fixo no canto inferior direito, empilhado acima
 * do botão do assistente virtual (assistente: bottom-6 right-6 w-14 → aqui:
 * bottom-24 right-6 w-14). Ao clicar abre um painel compacto com os mesmos
 * controles de antes (fonte, contraste, modo escuro, VLibras).
 */

const MIN_SCALE = 1;
const MAX_SCALE = 3;

export const AccessibilityBar = () => {
  const [open, setOpen] = useState(false);
  const [dark, toggleDark] = useDarkMode();
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState(MIN_SCALE);
  const [vlibrasOn, setVlibrasOn] = useState(false);
  const [vlibrasLoading, setVlibrasLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou pressionar Esc
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

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
    // VLibras fica ativo por padrão (widget oficial do governo sempre presente);
    // só não carrega se a pessoa o desativou explicitamente.
    if (saved !== "off") {
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
    "inline-flex items-center justify-center gap-1.5 h-8 min-w-[2rem] px-2 rounded-md text-xs font-semibold bg-muted text-foreground transition-colors hover:bg-muted/70 disabled:opacity-40 disabled:cursor-not-allowed";
  const btnActive = "bg-gold text-navy-dark hover:bg-gold-light";

  return (
    <div ref={rootRef} className="fixed bottom-24 right-6 z-50">
      {/* Painel popover (abre acima do botão) */}
      {open && (
        <div
          id="painel-acessibilidade"
          role="dialog"
          aria-label="Opções de acessibilidade"
          className="absolute bottom-full right-0 mb-3 w-72 max-w-[calc(100vw-48px)] rounded-xl border border-border bg-card text-card-foreground shadow-lg p-4 animate-fade-in"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-sm font-bold">
              <Accessibility className="w-4 h-4 text-gold" aria-hidden="true" />
              Acessibilidade
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar opções de acessibilidade"
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Escala de fonte */}
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Type className="w-3.5 h-3.5" aria-hidden="true" />
                Tamanho do texto
              </span>
              <div role="group" aria-label="Tamanho do texto" className="flex items-center gap-1">
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
              </div>
            </div>

            {/* Alto contraste */}
            <button
              type="button"
              onClick={toggleContrast}
              aria-pressed={highContrast}
              aria-label={highContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
              className={`${btnBase} w-full justify-start ${highContrast ? btnActive : ""}`}
            >
              <Contrast className="w-3.5 h-3.5" aria-hidden="true" />
              Alto contraste
            </button>

            {/* Modo escuro */}
            <button
              type="button"
              onClick={toggleDark}
              aria-pressed={dark}
              aria-label={dark ? "Desativar modo escuro" : "Ativar modo escuro"}
              className={`${btnBase} w-full justify-start ${dark ? btnActive : ""}`}
            >
              {dark ? (
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Moon className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {dark ? "Modo claro" : "Modo escuro"}
            </button>

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
              disabled={vlibrasLoading}
              className={`${btnBase} w-full justify-start ${vlibrasOn ? btnActive : ""}`}
            >
              <Accessibility className="w-3.5 h-3.5" aria-hidden="true" />
              {vlibrasLoading ? "Carregando…" : "VLibras (Língua de Sinais)"}
            </button>
          </div>
        </div>
      )}

      {/* Botão flutuante (acima do assistente virtual: bottom-6 → aqui bottom-24) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? "painel-acessibilidade" : undefined}
        aria-label={open ? "Fechar opções de acessibilidade" : "Abrir opções de acessibilidade"}
        title="Acessibilidade"
        className="w-14 h-14 rounded-full bg-navy text-white shadow-lg hover:shadow-xl hover:scale-110 hover:bg-gold hover:text-navy-dark transition-all duration-300 flex items-center justify-center"
      >
        <PersonStanding className="w-7 h-7" aria-hidden="true" />
      </button>
    </div>
  );
};
