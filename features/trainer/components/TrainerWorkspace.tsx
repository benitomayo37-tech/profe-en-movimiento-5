"use client";

import { useRef, useState } from "react";

import MacrocycleForm from "./MacrocycleForm";
import MacrocycleResultPanel from "./MacrocycleResultPanel";
import MesocycleForm from "./MesocycleForm";
import MesocycleResultPanel from "./MesocycleResultPanel";
import MicrocycleForm from "./MicrocycleForm";
import MicrocycleResultPanel from "./MicrocycleResultPanel";
import TrainerModuleGrid from "./TrainerModuleGrid";
import TrainerResultPanel from "./TrainerResultPanel";
import TrainingSessionForm from "./TrainingSessionForm";
import ProUpgradeDialog from "@/features/auth/components/ProUpgradeDialog";

import { generateMacrocycle } from "@/features/trainer/services/generateMacrocycle";
import { generateMesocycle } from "@/features/trainer/services/generateMesocycle";
import { generateMicrocycle } from "@/features/trainer/services/generateMicrocycle";
import {
  generateTrainingSession,
  TrainerRequestError,
} from "@/features/trainer/services/generateTrainingSession";
import type {
  GeneratedMacrocycle,
  GeneratedMesocycle,
  GeneratedMicrocycle,
  GeneratedTrainingSession,
  MacrocycleFormData,
  MesocycleFormData,
  MicrocycleFormData,
  TrainerModuleId,
  TrainingSessionFormData,
} from "@/features/trainer/types/trainer";

const initialFormData: TrainingSessionFormData = {
  sport: "Baloncesto",
  category: "Sub-16",
  level: "intermediate",
  focus: "combined",
  objective: "",
  durationMinutes: 90,
  athleteCount: 16,
  intensity: "moderate",
  materials: "4 balones, conos y silbato",
  space: "Cancha de baloncesto",
  competitionContext: "without-competition",
  additionalInstructions: "",
};

const initialMicrocycleFormData: MicrocycleFormData = {
  sport: "Baloncesto",
  category: "Sub-16",
  level: "intermediate",
  phase: "specific-preparation",
  weeklyObjective: "",
  trainingDays: ["monday", "wednesday", "friday"],
  sessionDurationMinutes: 90,
  athleteCount: 16,
  competitionDay: "none",
  materials: "4 balones, conos y silbato",
  space: "Cancha de baloncesto",
  additionalInstructions: "",
};

const initialMesocycleFormData: MesocycleFormData = {
  sport: "Baloncesto",
  category: "Sub-16",
  level: "intermediate",
  phase: "specific-preparation",
  mainObjective: "",
  weekCount: 4,
  sessionsPerWeek: 3,
  sessionDurationMinutes: 90,
  athleteCount: 16,
  competitionWeek: null,
  materials: "4 balones, conos y silbato",
  space: "Cancha de baloncesto",
  additionalInstructions: "",
};

const initialMacrocycleFormData: MacrocycleFormData = {
  sport: "Baloncesto",
  category: "Sub-16",
  level: "intermediate",
  seasonObjective: "",
  preparatoryWeeks: 8,
  competitiveWeeks: 3,
  transitionWeeks: 1,
  sessionsPerWeek: 3,
  sessionDurationMinutes: 90,
  athleteCount: 16,
  mainCompetitionWeek: 10,
  materials: "4 balones, conos y silbato",
  space: "Cancha de baloncesto",
  additionalInstructions: "",
};

interface TrainerWorkspaceProps {
  hasProAccess: boolean;
}

export default function TrainerWorkspace({
  hasProAccess,
}: TrainerWorkspaceProps) {
  const [selectedModule, setSelectedModule] =
    useState<TrainerModuleId>("training-session");
  const [formData, setFormData] =
    useState<TrainingSessionFormData>(initialFormData);
  const [microcycleFormData, setMicrocycleFormData] =
    useState<MicrocycleFormData>(initialMicrocycleFormData);
  const [mesocycleFormData, setMesocycleFormData] =
    useState<MesocycleFormData>(initialMesocycleFormData);
  const [macrocycleFormData, setMacrocycleFormData] =
    useState<MacrocycleFormData>(initialMacrocycleFormData);
  const [result, setResult] = useState<GeneratedTrainingSession | null>(null);
  const [microcycleResult, setMicrocycleResult] =
    useState<GeneratedMicrocycle | null>(null);
  const [mesocycleResult, setMesocycleResult] =
    useState<GeneratedMesocycle | null>(null);
  const [macrocycleResult, setMacrocycleResult] =
    useState<GeneratedMacrocycle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [lockedToolName, setLockedToolName] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  function updateField<K extends keyof TrainingSessionFormData>(
    field: K,
    value: TrainingSessionFormData[K],
  ) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function updateMicrocycleField<K extends keyof MicrocycleFormData>(
    field: K,
    value: MicrocycleFormData[K],
  ) {
    setMicrocycleFormData((current) => ({ ...current, [field]: value }));
  }

  function updateMesocycleField<K extends keyof MesocycleFormData>(
    field: K,
    value: MesocycleFormData[K],
  ) {
    setMesocycleFormData((current) => ({ ...current, [field]: value }));
  }

  function updateMacrocycleField<K extends keyof MacrocycleFormData>(
    field: K,
    value: MacrocycleFormData[K],
  ) {
    setMacrocycleFormData((current) => ({ ...current, [field]: value }));
  }

  function scrollToResult() {
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleModuleSelection(moduleId: TrainerModuleId) {
    setSelectedModule(moduleId);
    setResult(null);
    setMicrocycleResult(null);
    setMesocycleResult(null);
    setMacrocycleResult(null);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);
    setResult(null);
    setError("");
    scrollToResult();
    try {
      setResult(await generateTrainingSession(formData));
    } catch (requestError) {
      if (requestError instanceof TrainerRequestError && requestError.status === 429 && !hasProAccess) {
        setLockedToolName("Límite mensual alcanzado");
      }
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible generar la sesión.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleMicrocycleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setIsGenerating(true);
    setMicrocycleResult(null);
    setError("");
    scrollToResult();
    try {
      setMicrocycleResult(await generateMicrocycle(microcycleFormData));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible generar el microciclo.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleMesocycleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setIsGenerating(true);
    setMesocycleResult(null);
    setError("");
    scrollToResult();
    try {
      setMesocycleResult(await generateMesocycle(mesocycleFormData));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible generar el mesociclo.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleMacrocycleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setIsGenerating(true);
    setMacrocycleResult(null);
    setError("");
    scrollToResult();
    try {
      setMacrocycleResult(await generateMacrocycle(macrocycleFormData));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible generar el macrociclo.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-900 to-emerald-600 px-6 py-10 text-white shadow-xl sm:px-8 lg:px-10">
        <div className="max-w-4xl">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
            Rendimiento · Planificación · Seguridad
          </span>
          <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            Entrenador IA
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">
            Diseña sesiones, microciclos, mesociclos y macrociclos adaptados al
            deporte, la categoría, los recursos y los objetivos de cada etapa.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-xl bg-white/10 px-4 py-2">
              Progresión coherente
            </span>
            <span className="rounded-xl bg-white/10 px-4 py-2">
              Recuperación planificada
            </span>
            <span className="rounded-xl bg-white/10 px-4 py-2">
              Control de la intensidad
            </span>
          </div>
        </div>
      </section>

      <TrainerModuleGrid
        selectedModule={selectedModule}
        hasProAccess={hasProAccess}
        onSelectModule={handleModuleSelection}
        onProRequired={setLockedToolName}
      />

      {selectedModule === "training-session" ? (
        <TrainingSessionForm
          formData={formData}
          onFieldChange={updateField}
          onSubmit={handleSubmit}
        />
      ) : null}
      {selectedModule === "microcycle" ? (
        <MicrocycleForm
          formData={microcycleFormData}
          isGenerating={isGenerating}
          onFieldChange={updateMicrocycleField}
          onSubmit={handleMicrocycleSubmit}
        />
      ) : null}
      {selectedModule === "mesocycle" ? (
        <MesocycleForm
          formData={mesocycleFormData}
          isGenerating={isGenerating}
          onFieldChange={updateMesocycleField}
          onSubmit={handleMesocycleSubmit}
        />
      ) : null}
      {selectedModule === "macrocycle" ? (
        <MacrocycleForm
          formData={macrocycleFormData}
          isGenerating={isGenerating}
          onFieldChange={updateMacrocycleField}
          onSubmit={handleMacrocycleSubmit}
        />
      ) : null}

      <div ref={resultRef} className="scroll-mt-6">
        {selectedModule === "training-session" ? (
          <TrainerResultPanel
            result={result}
            isGenerating={isGenerating}
            error={error}
          />
        ) : null}
        {selectedModule === "microcycle" ? (
          <MicrocycleResultPanel
            result={microcycleResult}
            isGenerating={isGenerating}
            error={error}
          />
        ) : null}
        {selectedModule === "mesocycle" ? (
          <MesocycleResultPanel
            result={mesocycleResult}
            isGenerating={isGenerating}
            error={error}
          />
        ) : null}
        {selectedModule === "macrocycle" ? (
          <MacrocycleResultPanel
            result={macrocycleResult}
            isGenerating={isGenerating}
            error={error}
          />
        ) : null}
      </div>

      <ProUpgradeDialog
        open={lockedToolName !== null}
        toolName={lockedToolName ?? "Herramienta Pro"}
        onClose={() => setLockedToolName(null)}
      />
    </div>
  );
}
