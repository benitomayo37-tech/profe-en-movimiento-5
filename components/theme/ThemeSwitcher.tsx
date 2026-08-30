"use client";

import { useEffect, useRef, useState } from "react";

export type ThemePreference = "system" | "light" | "dark" | "sepia";

const STORAGE_KEY = "pem-global-theme";
const THEME_EVENT = "pem-theme-change";

const themes: Array<{ value: ThemePreference; label: string; icon: string }> = [
  { value: "system", label: "Sistema", icon: "◐" },
  { value: "light", label: "Claro", icon: "☀" },
  { value: "dark", label: "Oscuro", icon: "☾" },
  { value: "sepia", label: "Sepia", icon: "◒" },
];

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark" || value === "sepia";
}

function resolveTheme(preference: ThemePreference) {
  if (preference !== "system") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  root.dataset.themePreference = preference;
  root.dataset.theme = resolveTheme(preference);
  root.style.colorScheme = root.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeSwitcher({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [preference, setPreference] = useState<ThemePreference>("system");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = isThemePreference(stored) ? stored : "system";
    applyTheme(initial);
    const timer = window.setTimeout(() => setPreference(initial), 0);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if ((localStorage.getItem(STORAGE_KEY) || "system") === "system") applyTheme("system");
    };
    const handleThemeEvent = (event: Event) => {
      const next = (event as CustomEvent<ThemePreference>).detail;
      if (isThemePreference(next)) { setPreference(next); applyTheme(next); }
    };
    media.addEventListener("change", handleSystemChange);
    window.addEventListener(THEME_EVENT, handleThemeEvent);
    return () => {
      window.clearTimeout(timer);
      media.removeEventListener("change", handleSystemChange);
      window.removeEventListener(THEME_EVENT, handleThemeEvent);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const current = themes.find((theme) => theme.value === preference) || themes[0];

  function selectTheme(next: ThemePreference) {
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    setPreference(next);
    setOpen(false);
    window.dispatchEvent(new CustomEvent<ThemePreference>(THEME_EVENT, { detail: next }));
  }

  return (
    <div ref={containerRef} className={`theme-switcher relative ${mobile ? "w-full" : "shrink-0"}`}>
      <button
        type="button"
        aria-label={`Tema: ${current.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`${mobile ? "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-black" : "flex h-10 w-10 items-center justify-center rounded-full border text-lg"} border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100`}
      >
        {mobile ? <><span>Apariencia</span><span aria-hidden="true">{current.icon}</span></> : <span aria-hidden="true">{current.icon}</span>}
      </button>

      {open ? (
        <div role="menu" aria-label="Seleccionar apariencia" className={`${mobile ? "relative mt-2 w-full" : "absolute right-0 top-12 z-[100] w-52"} overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl`}>
          {themes.map((theme) => (
            <button
              key={theme.value}
              type="button"
              role="menuitemradio"
              aria-checked={preference === theme.value}
              onClick={() => selectTheme(theme.value)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${preference === theme.value ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"}`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-base" aria-hidden="true">{theme.icon}</span>
              <span className="flex-1">{theme.label}</span>
              {preference === theme.value ? <span aria-hidden="true">✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
