import Card from "@/components/ui/Card";

export default function RecentActivity() {
  return (
    <Card className="border-slate-200 p-6 sm:p-8">
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl"
          aria-hidden="true"
        >
          🕘
        </div>

        <h3 className="mt-5 text-lg font-black text-slate-900">
          Aún no hay actividad reciente
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
          Cuando comiences a crear planificaciones, recursos o consultas
          con Profe IA, aquí podrás continuar rápidamente donde lo dejaste.
        </p>
      </div>
    </Card>
  );
}