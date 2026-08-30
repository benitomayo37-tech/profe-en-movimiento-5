"use client";

import { useEffect, useRef } from "react";

import type { MiniAppDefinition } from "@/features/apps/data/miniApps";

interface EmbeddedMiniAppProps {
  app: MiniAppDefinition;
}

export default function EmbeddedMiniApp({ app }: EmbeddedMiniAppProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const allowedKeys = new Set([
      "profe_retos_last",
      "profe_retos_completados",
      "profe_retos",
      "profe_planes_clase",
      "pem-evaluador-inclusivo-v2",
    ]);

    const handleMessage = (event: MessageEvent) => {
      const frameWindow = iframeRef.current?.contentWindow;
      if (!frameWindow || event.source !== frameWindow) return;

      const message = event.data as
        | { type?: string; action?: string; key?: string; value?: string }
        | undefined;
      if (message?.type !== "pem-miniapp-storage") return;

      if (message.action === "ready") {
        const values: Record<string, string | null> = {};
        for (const key of allowedKeys) {
          try {
            values[key] = window.localStorage.getItem(key);
          } catch {
            values[key] = null;
          }
        }
        frameWindow.postMessage({ type: "pem-miniapp-storage-response", values }, "*");
        return;
      }

      if (message.action === "set" && message.key && allowedKeys.has(message.key)) {
        try {
          window.localStorage.setItem(message.key, message.value ?? "");
        } catch {
          // The miniapp keeps an in-memory fallback when storage is unavailable.
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!app.embeddedAsset) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
            Herramienta interactiva
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Trabaja directamente en el panel. La herramienta tiene desplazamiento propio.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800">
          <span aria-hidden="true">●</span> Disponible
        </span>
      </div>

      <iframe
        ref={iframeRef}
        onLoad={() => {
          const frameWindow = iframeRef.current?.contentWindow;
          if (!frameWindow) return;
          const values: Record<string, string | null> = {};
          for (const key of [
            "profe_retos_last",
            "profe_retos_completados",
            "profe_retos",
            "profe_planes_clase",
            "pem-evaluador-inclusivo-v2",
          ]) {
            try {
              values[key] = window.localStorage.getItem(key);
            } catch {
              values[key] = null;
            }
          }
          frameWindow.postMessage({ type: "pem-miniapp-storage-response", values }, "*");
        }}
        src={`/api/miniapps/${app.id}`}
        title={app.title}
        loading="eager"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-downloads allow-modals allow-same-origin"
        allow="web-share"
        className="h-[780px] w-full border-0 bg-white sm:h-[900px] lg:h-[980px]"
      />
    </section>
  );
}
