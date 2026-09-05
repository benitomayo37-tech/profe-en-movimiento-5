"use client";

import { useRef, useState } from "react";

import PhysicalPlannerForm from "@/features/physical-planner/components/PhysicalPlannerForm";
import PhysicalPlannerHistory from "@/features/physical-planner/components/PhysicalPlannerHistory";
import PhysicalPlanResultPanel from "@/features/physical-planner/components/PhysicalPlanResultPanel";
import {
  generatePhysicalPlan,
  PhysicalPlannerRequestError,
} from "@/features/physical-planner/services/generatePhysicalPlan";
import type {
  GeneratedPhysicalPlan,
  PhysicalPlannerFormData,
  PhysicalPlannerUsage,
} from "@/features/physical-planner/types/physicalPlanner";

const initialFormData: PhysicalPlannerFormData = {
  context: "physical_education",
  activityOrSport: "Capacidades físicas",
  group: "1ro BGU",
  level: "initiation",
  capacity: "combined",
  objective: "",
  durationMinutes: 45,
  participantCount: 40,
  intensity: "moderate",
  experience: "Grupo heterogéneo con experiencia básica",
  materials: "Únicamente 4 balones",
  space: "Cancha escolar",
  inclusionNeeds: "",
  safetyNotes: "",
  additionalInstructions: "",
};

interface PhysicalPlannerWorkspaceProps {
  hasProAccess: boolean;
}

export default function PhysicalPlannerWorkspace({
  hasProAccess,
}: PhysicalPlannerWorkspaceProps) {
  const [formData, setFormData] =
    useState<PhysicalPlannerFormData>(
      initialFormData,
    );
  const [result, setResult] =
    useState<GeneratedPhysicalPlan | null>(null);
  const [usage, setUsage] =
    useState<PhysicalPlannerUsage | null>(null);
  const [isGenerating, setIsGenerating] =
    useState(false);
  const [error, setError] = useState("");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  function updateField<
    K extends keyof PhysicalPlannerFormData,
  >(
    field: K,
    value: PhysicalPlannerFormData[K],
  ) {
    setFormData((current) => {
      const updated = {
        ...current,
        [field]: value,
      };

      if (
        field === "context" &&
        value === "physical_education"
      ) {
        updated.activityOrSport =
          current.context === "sport"
            ? "Capacidades físicas"
            : current.activityOrSport;
        updated.group =
          current.context === "sport"
            ? "1ro BGU"
            : current.group;
      }

      if (
        field === "context" &&
        value === "sport"
      ) {
        updated.activityOrSport =
          current.context === "physical_education"
            ? ""
            : current.activityOrSport;
        updated.group =
          current.context === "physical_education"
            ? ""
            : current.group;
      }

      return updated;
    });

    setError("");
  }

  function handleOpenSavedSession(
    savedFormData: PhysicalPlannerFormData,
    savedResult: GeneratedPhysicalPlan,
  ) {
    setFormData(savedFormData);
    setResult(savedResult);
    setUsage(null);
    setError("");

    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }
  function scrollToResult() {
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsGenerating(true);
    setResult(null);
    setUsage(null);
    setError("");
    scrollToResult();

    try {
      const response =
        await generatePhysicalPlan(formData);

      setResult(response.data);
      setUsage(response.usage);
      setHistoryRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible generar la sesión.",
      );

      if (
        requestError instanceof
          PhysicalPlannerRequestError &&
        requestError.status === 401
      ) {
        setError(
          "Tu sesión no está disponible. Inicia sesión nuevamente.",
        );
      }
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-orange-600 px-6 py-10 text-white shadow-xl sm:px-8 lg:px-10">
        <div className="max-w-4xl">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-orange-100">
            Preparación física inteligente
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            Planificador Físico
          </h2>

          <p className="mt-3 text-lg font-bold text-orange-200">
            Carga, tiempo y progresión bajo control.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">
            Diseña sesiones físicas para Educación Física
            y deporte con tiempos exactos, recuperación,
            organización simultánea, carga estimada,
            adaptaciones y seguridad.
          </p>

          <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-xl bg-white/10 px-4 py-2">
              Duración comprobada
            </span>
            <span className="rounded-xl bg-white/10 px-4 py-2">
              Intervalos exactos
            </span>
            <span className="rounded-xl bg-white/10 px-4 py-2">
              Carga mediante RPE
            </span>
            <span className="rounded-xl bg-white/10 px-4 py-2">
              DUA en Educación Física
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <FeatureCard
          icon="⏱️"
          title="Tiempo exacto"
          description="Cada bloque y actividad se verifica matemáticamente."
        />
        <FeatureCard
          icon="📈"
          title="Carga controlada"
          description="La sesión relaciona duración, intensidad y RPE."
        />
        <FeatureCard
          icon="🛡️"
          title="Aplicación segura"
          description="Incluye progresión, pausas y criterios para detener o ajustar."
        />
      </section>

      <PhysicalPlannerHistory
        refreshKey={historyRefreshKey}
        onOpen={handleOpenSavedSession}
      />
      <PhysicalPlannerForm
        formData={formData}
        hasProAccess={hasProAccess}
        isGenerating={isGenerating}
        onFieldChange={updateField}
        onSubmit={handleSubmit}
      />

      <div
        ref={resultRef}
        className="scroll-mt-6"
      >
        <PhysicalPlanResultPanel
          result={result}
          context={formData.context}
          usage={usage}
          isGenerating={isGenerating}
          error={error}
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span
        aria-hidden="true"
        className="text-2xl"
      >
        {icon}
      </span>

      <h3 className="mt-3 font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </article>
  );
}