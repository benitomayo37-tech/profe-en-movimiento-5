"use client";

import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import AIConfigurationForm from "./AIConfigurationForm";
import AIHero from "./AIHero";
import AIQuickActions from "./AIQuickActions";
import AIResultPanel from "./AIResultPanel";
import AIToolsGrid from "./AIToolsGrid";
import ProUpgradeDialog from "@/features/auth/components/ProUpgradeDialog";

import {
  AIRequestError,
  generateAIResponse,
} from "@/features/ai/services/generateAIResponse";
import type {
  AIFormData,
  AIToolId,
  GeneratedAIContent,
} from "@/features/ai/types/ai";
import { convertResultToText } from "@/features/ai/utils/convertResultToText";

interface AIWorkspaceProps {
  sourceResourceSlug?: string;
  userName?: string;
  hasProAccess: boolean;
}

const initialFormData: AIFormData = {
  toolId: "lesson-plan",
  planningMethodology: "automatic",
  objectiveTaxonomy: "automatic",
  topic: "",
  educationalLevel:
    "Bachillerato General Unificado",
  grade: "1ro BGU",
  duration: "45 minutos",
  students: "40 estudiantes",
  materials: "4 balones, conos y silbato",
  curriculumCode: "",
  includeDua: true,
  includeNee: false,
  additionalInstructions: "",
  examConfig: {
    examType: "theoretical",
    difficulty: "intermediate",
    totalScore: 10,
    versionMode: "A",
    includeAnswerKey: true,
    includeGradingTable: true,
    includeRuleOfThree: true,
    questionDistribution: [
      {
        type: "multiple-choice",
        quantity: 5,
        pointsPerQuestion: 1,
      },
      {
        type: "true-false",
        quantity: 5,
        pointsPerQuestion: 1,
      },
    ],
  },
};

export default function AIWorkspace({
  sourceResourceSlug,
  userName = "profe",
  hasProAccess,
}: AIWorkspaceProps) {
  const [formData, setFormData] =
    useState<AIFormData>({
      ...initialFormData,
      sourceResourceSlug,
    });

  const [result, setResult] =
    useState<GeneratedAIContent | null>(null);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [notification, setNotification] =
    useState("");

  const [lockedToolName, setLockedToolName] =
    useState<string | null>(null);

  const configurationRef =
    useRef<HTMLDivElement>(null);

  function updateField<K extends keyof AIFormData>(
    field: K,
    value: AIFormData[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleToolSelection(
    toolId: AIToolId,
  ) {
    updateField("toolId", toolId);
    setResult(null);
  }

  function handleQuickActionSelection(
    toolId: AIToolId,
  ) {
    flushSync(() => {
      updateField("toolId", toolId);
      setResult(null);
    });

    requestAnimationFrame(() => {
      const configurationElement =
        configurationRef.current;

      if (!configurationElement) {
        return;
      }

      const top =
        configurationElement.getBoundingClientRect()
          .top +
        window.scrollY -
        24;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    });
  }

  async function handleGenerate(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsGenerating(true);
    setResult(null);
    setNotification("");

    try {
      const requestData: AIFormData =
  formData.toolId === "exam"
    ? formData
    : {
        ...formData,
        examConfig: undefined,
      };

const generatedResult =
  await generateAIResponse(requestData);

      setResult(generatedResult);

      setNotification(
        "Contenido generado correctamente por Profe IA.",
      );
    } catch (error: unknown) {
      if (error instanceof AIRequestError) {
        setNotification(error.message);
        if (error.status === 429 && !hasProAccess) {
          setLockedToolName("Límite mensual alcanzado");
        }
      } else {
        setNotification(
          "Ocurrió un error inesperado al generar el contenido.",
        );
      }
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        convertResultToText(result),
      );

      setNotification(
        "Contenido copiado al portapapeles.",
      );
    } catch {
      setNotification(
        "No fue posible copiar el contenido.",
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AIHero
          sourceResourceSlug={sourceResourceSlug}
          userName={userName}
        />

        <div className="mt-8">
          <AIQuickActions
            hasProAccess={hasProAccess}
            onSelectTool={
              handleQuickActionSelection
            }
            onProRequired={setLockedToolName}
          />
        </div>

        <div className="mt-8 space-y-8">
          <AIToolsGrid
            selectedToolId={formData.toolId}
            hasProAccess={hasProAccess}
            onSelectTool={handleToolSelection}
            onProRequired={setLockedToolName}
          />

          <div
            ref={configurationRef}
            className="scroll-mt-6"
          >
            <AIConfigurationForm
              formData={formData}
              isGenerating={isGenerating}
              onFieldChange={updateField}
              onSubmit={handleGenerate}
            />
          </div>

          <AIResultPanel
            result={result}
            isGenerating={isGenerating}
            notification={notification}
            onCopy={handleCopy}
          />
        </div>
      </section>

      <ProUpgradeDialog
        open={lockedToolName !== null}
        toolName={lockedToolName ?? "Herramienta Pro"}
        onClose={() => setLockedToolName(null)}
      />
    </div>
  );
}
