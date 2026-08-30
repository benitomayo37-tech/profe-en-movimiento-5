import type { Metadata } from "next";

import { AccountBadge, AppLayout } from "@/components/layout";
import Container from "@/components/ui/Container";
import { getAuthAccess } from "@/features/auth/server/access";
import MovimientoParaTodosSidebar from "@/features/movimiento-para-todos/components/MovimientoParaTodosSidebar";
import MovimientoParaTodosWorkspace from "@/features/movimiento-para-todos/components/MovimientoParaTodosWorkspace";
import { chronicDiseasesExercises as allChronicDiseasesExercises } from "@/features/movimiento-para-todos/data/chronicDiseases";
import { caregiverGuidance as allCaregiverGuidance } from "@/features/movimiento-para-todos/data/caregiverGuidance";
import { olderAdultsExercises as allOlderAdultsExercises } from "@/features/movimiento-para-todos/data/olderAdults";
import { prenatalExercises as allPrenatalExercises } from "@/features/movimiento-para-todos/data/prenatal";
import { reducedMobilityExercises as allReducedMobilityExercises } from "@/features/movimiento-para-todos/data/reducedMobility";
import {
  isFreeCaregiverGuidance,
  isFreeExercise,
} from "@/features/movimiento-para-todos/data/access";
import type {
  MovementExercise,
  MovementManeuver,
} from "@/features/movimiento-para-todos/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Movimiento para Todos | Profe en Movimiento",
  description:
    "Actividad física adaptada, segura e inclusiva para diferentes poblaciones y para quienes las acompañan.",
};

function exercisesForAccess(
  exercises: MovementExercise[],
  hasProAccess: boolean,
) {
  if (hasProAccess) return exercises;

  return exercises.map((exercise) =>
    isFreeExercise(exercise.id)
      ? exercise
      : {
          ...exercise,
          materials: [],
          instructions: [],
          benefits: [],
          adaptations: [],
          safety: [],
          stopIf: [],
          contraindications: [],
        },
  );
}

function caregiverContentForAccess(
  items: MovementManeuver[],
  hasProAccess: boolean,
) {
  if (hasProAccess) return items;

  return items.map((item) =>
    isFreeCaregiverGuidance(item.id)
      ? item
      : {
          ...item,
          preparation: [],
          steps: [],
          personPosition: undefined,
          caregiverPosition: undefined,
          safety: [],
          doNotAttemptIf: [],
          assistiveDevices: [],
        },
  );
}

export default async function MovimientoParaTodosPage() {
  const access = await getAuthAccess();

  return (
    <AppLayout
      sidebar={<MovimientoParaTodosSidebar />}
      header={
        <div className="flex min-h-20 items-center justify-between gap-4 px-6">
          <div>
            <h1 className="text-lg font-bold text-slate-950">
              Movimiento para Todos
            </h1>

            <p className="text-sm text-slate-500">
              Actividad física adaptada, segura e inclusiva.
            </p>
          </div>

          <AccountBadge
            authenticated={access.authenticated}
            email={access.email}
            fullName={access.fullName}
            className="bg-emerald-600"
          />
        </div>
      }
      footer={
        <div className="px-6 py-4 text-center text-xs text-slate-500">
          Movimiento para Todos · Actividad física adaptada y acompañamiento
        </div>
      }
    >
      <Container size="wide" className="py-8">
        <div className="movement-for-all-page">
          <MovimientoParaTodosWorkspace
            hasProAccess={access.hasProAccess}
            olderAdultsExercises={exercisesForAccess(allOlderAdultsExercises, access.hasProAccess)}
            chronicDiseasesExercises={exercisesForAccess(allChronicDiseasesExercises, access.hasProAccess)}
            prenatalExercises={exercisesForAccess(allPrenatalExercises, access.hasProAccess)}
            reducedMobilityExercises={exercisesForAccess(allReducedMobilityExercises, access.hasProAccess)}
            caregiverGuidance={caregiverContentForAccess(allCaregiverGuidance, access.hasProAccess)}
          />
        </div>
      </Container>
    </AppLayout>
  );
}
