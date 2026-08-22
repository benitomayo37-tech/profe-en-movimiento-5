$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path
$welcomePath = Join-Path $projectRoot "components\dashboard\WelcomeSection.tsx"
$aiHeroPath = Join-Path $projectRoot "features\ai\components\AIHero.tsx"

foreach ($requiredPath in @($welcomePath, $aiHeroPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "No se encontro el archivo requerido: $requiredPath"
    }
}

$welcomeContent = @'
import Link from "next/link";

interface WelcomeSectionProps {
  userName?: string;
}

export default function WelcomeSection({
  userName = "Armando",
}: WelcomeSectionProps) {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600 px-6 py-8 text-white shadow-xl sm:px-8 lg:px-10">
      <div className="max-w-4xl">
        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
          Centro de operaciones
        </span>

        <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
          Bienvenido, {userName}
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">
          Organiza tus clases, crea recursos educativos y planifica
          entrenamientos deportivos con Profe IA y Entrenador IA desde un
          solo lugar.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/ai"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-600"
          >
            Abrir Profe IA
          </Link>

          <Link
            href="/entrenador-ia"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-600"
          >
            Abrir Entrenador IA
          </Link>

          <Link
            href="/resources"
            className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
          >
            Explorar recursos
          </Link>
        </div>
      </div>
    </section>
  );
}
'@

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($welcomePath, $welcomeContent, $utf8WithoutBom)

$welcomeCheck = [System.IO.File]::ReadAllText($welcomePath)
$aiCheck = [System.IO.File]::ReadAllText($aiHeroPath)

if ($welcomeCheck -match 'profe-armando-hero') {
    throw "La fotografia todavia aparece en el Dashboard"
}

if ($aiCheck -match 'profe-armando-hero') {
    throw "La fotografia personal todavia aparece en Profe IA"
}

if ($aiCheck -notmatch 'profe-ia-robot') {
    throw "El robot de Profe IA no fue encontrado"
}

Write-Host "Limpieza completada correctamente." -ForegroundColor Green
Write-Host "- Dashboard: Hero limpio, sin fotografia personal." -ForegroundColor Green
Write-Host "- Profe IA: sin fotografia personal; robot conservado." -ForegroundColor Green
Write-Host "Ahora ejecuta: npm run lint" -ForegroundColor Cyan

