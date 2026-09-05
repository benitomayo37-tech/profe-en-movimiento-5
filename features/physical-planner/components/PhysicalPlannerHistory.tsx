"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  GeneratedPhysicalPlan,
  PhysicalPlannerFormData,
} from "@/features/physical-planner/types/physicalPlanner";
import {
  isGeneratedPhysicalPlan,
  isValidPhysicalPlannerFormData,
} from "@/features/physical-planner/utils/validatePhysicalPlan";

interface SavedPhysicalSession {
  id: string;
  context: "physical_education" | "sport";
  title: string;
  form_data: PhysicalPlannerFormData;
  result_data: GeneratedPhysicalPlan;
  created_at: string;
}

interface HistoryResponse {
  success: boolean;
  message?: string;
  sessions?: SavedPhysicalSession[];
  historyLimit?: number;
}

interface PhysicalPlannerHistoryProps {
  refreshKey: number;
  onOpen: (
    formData: PhysicalPlannerFormData,
    result: GeneratedPhysicalPlan,
  ) => void;
}

export default function PhysicalPlannerHistory({
  refreshKey,
  onOpen,
}: PhysicalPlannerHistoryProps) {
  const [sessions, setSessions] =
    useState<SavedPhysicalSession[]>([]);
  const [historyLimit, setHistoryLimit] =
    useState(3);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] =
    useState(true);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          "/api/physical-planner/sessions",
          {
            cache: "no-store",
          },
        );

        const result =
          (await response.json()) as HistoryResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ??
              "No fue posible consultar el historial.",
          );
        }

        if (!active) return;

        const validSessions = (
          result.sessions ?? []
        ).filter(
          (session) =>
            typeof session.id === "string" &&
            typeof session.title === "string" &&
            typeof session.created_at === "string" &&
            isValidPhysicalPlannerFormData(
              session.form_data,
            ) &&
            isGeneratedPhysicalPlan(
              session.result_data,
            ),
        );

        setSessions(validSessions);
        setHistoryLimit(result.historyLimit ?? 3);
      } catch (requestError) {
        if (!active) return;

        setError(
          requestError instanceof Error
            ? requestError.message
            : "No fue posible consultar el historial.",
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");

    if (!query) {
      return sessions;
    }

    return sessions.filter((session) => {
      const searchable =
        `${session.title} ${session.form_data.activityOrSport} ${session.form_data.group}`
          .toLocaleLowerCase("es");

      return searchable.includes(query);
    });
  }, [search, sessions]);

  async function handleDelete(
    session: SavedPhysicalSession,
  ) {
    const confirmed = window.confirm(
      `¿Deseas eliminar "${session.title}"? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) return;

    setDeletingId(session.id);
    setError("");

    try {
      const response = await fetch(
        "/api/physical-planner/sessions",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: session.id,
          }),
        },
      );

      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message ??
            "No fue posible eliminar la sesión.",
        );
      }

      setSessions((current) =>
        current.filter(
          (item) => item.id !== session.id,
        ),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible eliminar la sesión.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
            Historial automático
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Sesiones guardadas
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Conservamos tus últimas {historyLimit} sesiones
            según tu plan.
          </p>
        </div>

        <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700">
          {sessions.length}/{historyLimit}
        </span>
      </div>

      <label className="mt-5 block">
        <span className="sr-only">
          Buscar una sesión guardada
        </span>

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar por título, actividad, deporte o grupo..."
          className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </label>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
        >
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-5 text-sm text-slate-500">
          Consultando sesiones guardadas...
        </p>
      ) : null}

      {!isLoading && sessions.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="font-black text-slate-900">
            Todavía no tienes sesiones guardadas
          </p>
          <p className="mt-2 text-sm text-slate-600">
            La primera planificación aprobada se guardará
            automáticamente.
          </p>
        </div>
      ) : null}

      {!isLoading &&
      sessions.length > 0 &&
      filteredSessions.length === 0 ? (
        <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          No encontramos sesiones con ese criterio.
        </p>
      ) : null}

      {filteredSessions.length > 0 ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {filteredSessions.map((session) => (
            <article
              key={session.id}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                    session.context ===
                    "physical_education"
                      ? "bg-orange-600 text-white shadow-sm"
                      : "bg-blue-600 text-white shadow-sm"
                  }`}
                >
                  {session.context ===
                  "physical_education"
                    ? "Educación Física"
                    : "Preparación deportiva"}
                </span>

                <time className="text-xs text-slate-500">
                  {new Intl.DateTimeFormat("es-EC", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(
                    new Date(session.created_at),
                  )}
                </time>
              </div>

              <h3 className="mt-4 line-clamp-2 font-black text-slate-950">
                {session.title}
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                {session.form_data.activityOrSport}
                {" · "}
                {session.form_data.group}
                {" · "}
                {session.result_data.totalMinutes} min
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onOpen(
                      session.form_data,
                      session.result_data,
                    )
                  }
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                >
                  Abrir sesión
                </button>

                <button
                  type="button"
                  disabled={
                    deletingId === session.id
                  }
                  onClick={() =>
                    void handleDelete(session)
                  }
                  className="rounded-xl bg-red-50 px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:opacity-50"
                >
                  {deletingId === session.id
                    ? "Eliminando..."
                    : "Eliminar"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}