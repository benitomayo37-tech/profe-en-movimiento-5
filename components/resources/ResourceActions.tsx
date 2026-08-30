"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import type { ResourceStats } from "@/features/resources/server/library";

interface ResourceActionsProps {
  slug: string;
  title: string;
  hasDownload: boolean;
  aiReady: boolean;
  authenticated: boolean;
  initialFavorite: boolean;
  initialStats: ResourceStats;
}

export default function ResourceActions({
  slug,
  title,
  hasDownload,
  aiReady,
  authenticated,
  initialFavorite,
  initialStats,
}: ResourceActionsProps) {
  const [message, setMessage] = useState("");
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [pending, setPending] = useState(false);
  const [stats, setStats] = useState(initialStats);

  function showTemporaryMessage(nextMessage: string) {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(""), 3000);
  }

  async function postAction(action: "favorite" | "unfavorite" | "download") {
    return fetch(`/api/resources/${encodeURIComponent(slug)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
      keepalive: action === "download",
    });
  }

  async function handleFavorite() {
    if (!authenticated) {
      window.location.href = `/login?next=${encodeURIComponent(`/resources/${slug}`)}`;
      return;
    }

    setPending(true);
    try {
      const nextFavorite = !isFavorite;
      const response = await postAction(nextFavorite ? "favorite" : "unfavorite");
      if (!response.ok) throw new Error("favorite_failed");
      setIsFavorite(nextFavorite);
      showTemporaryMessage(nextFavorite ? "Recurso agregado a tus favoritos." : "Recurso retirado de tus favoritos.");
    } catch {
      showTemporaryMessage("No fue posible actualizar tus favoritos.");
    } finally {
      setPending(false);
    }
  }

  async function handleShare() {
    const shareData = {
      title,
      text: `Consulta este recurso educativo en Profe en Movimiento: ${title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showTemporaryMessage("Recurso compartido.");
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      showTemporaryMessage("Enlace copiado al portapapeles.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      showTemporaryMessage("No fue posible compartir el recurso.");
    }
  }

  async function handleDownload() {
    setPending(true);
    try {
      const response = await postAction("download");
      const result = (await response.json()) as {
        error?: string;
        downloadUrl?: string;
        stats?: { view_count?: number; download_count?: number };
      };
      if (response.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(`/resources/${slug}`)}`;
        return;
      }
      if (!response.ok || !result.downloadUrl) {
        showTemporaryMessage(result.error ?? "No fue posible descargar el recurso.");
        return;
      }
      setStats((current) => ({
        views: Number(result.stats?.view_count) || current.views,
        downloads: Number(result.stats?.download_count) || current.downloads + 1,
      }));
      window.location.assign(result.downloadUrl);
    } catch {
      showTemporaryMessage("No fue posible descargar el recurso.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-center">
        <div><strong className="block text-xl text-slate-950">{stats.views}</strong><span className="text-xs text-slate-500">Visualizaciones</span></div>
        <div><strong className="block text-xl text-slate-950">{stats.downloads}</strong><span className="text-xs text-slate-500">Descargas reales</span></div>
      </div>

      <div className="space-y-3">
        {hasDownload ? (
          <button type="button" disabled={pending} onClick={() => void handleDownload()} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-orange-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
            <span aria-hidden="true">⬇️</span><span className="ml-2">{pending ? "Preparando descarga..." : "Descargar recurso"}</span>
          </button>
        ) : (
          <button type="button" disabled className="flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-200 px-5 py-3 text-sm font-bold text-slate-500">Descarga próximamente</button>
        )}

        {aiReady ? (
          <Link href={`/ai?resource=${encodeURIComponent(slug)}`} className="flex min-h-12 w-full items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-5 py-3 text-center text-sm font-bold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
            <Image src="/images/profe-ia-robot.png" alt="" width={28} height={36} className="h-7 w-auto object-contain" />
            <span className="ml-2">Adaptar con Profe IA</span>
          </Link>
        ) : null}

        <button type="button" onClick={() => void handleFavorite()} disabled={pending} aria-pressed={isFavorite} className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
          <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
          <span className="ml-2">{pending ? "Guardando..." : isFavorite ? "Guardado en favoritos" : "Agregar a favoritos"}</span>
        </button>

        <button type="button" onClick={() => void handleShare()} className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
          <span aria-hidden="true">🔗</span><span className="ml-2">Compartir recurso</span>
        </button>
      </div>

      <p aria-live="polite" className={`mt-4 min-h-6 rounded-lg px-3 py-2 text-center text-xs font-semibold transition ${message ? "bg-emerald-50 text-emerald-700" : "text-transparent"}`}>
        {message || "Sin notificaciones"}
      </p>
    </div>
  );
}
