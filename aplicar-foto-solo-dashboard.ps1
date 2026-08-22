$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path
$dashboardPath = Join-Path $projectRoot "features\dashboard\components\DashboardHero.tsx"
$aiHeroPath = Join-Path $projectRoot "features\ai\components\AIHero.tsx"
$photoPath = Join-Path $projectRoot "public\images\profe-armando-hero.png"

foreach ($requiredPath in @($dashboardPath, $aiHeroPath, $photoPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "No se encontro el archivo requerido: $requiredPath"
    }
}

function Read-Utf8File([string]$path) {
    return [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
}

function Write-Utf8File([string]$path, [string]$content) {
    $utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($path, $content, $utf8WithoutBom)
}

# 1. Instalar la fotografia exclusivamente en el Hero del Dashboard.
$dashboard = Read-Utf8File $dashboardPath

if ($dashboard -notmatch 'import\s+Image\s+from\s+["'']next/image["''];') {
    $dashboard = 'import Image from "next/image";' + [Environment]::NewLine + $dashboard
}

# Quita cualquier version anterior del bloque instalado por este corrector.
$dashboard = [regex]::Replace(
    $dashboard,
    '(?s)\s*\{\/\* FOTO EXCLUSIVA DEL DASHBOARD: INICIO \*\/\}.*?\{\/\* FOTO EXCLUSIVA DEL DASHBOARD: FIN \*\/\}\s*',
    [Environment]::NewLine
)

# Quita implementaciones anteriores que usen la misma fotografia dentro de este componente.
$dashboard = [regex]::Replace(
    $dashboard,
    '(?s)\s*<div[^>]*>\s*(?:<div[^>]*/>\s*)?<Image\s+[^>]*src=["'']/images/profe-armando-hero\.png["''][^>]*/>\s*</div>\s*',
    [Environment]::NewLine
)

if ($dashboard -notmatch '<Card\s+className="[^"]*relative') {
    $dashboard = [regex]::Replace(
        $dashboard,
        '<Card\s+className="',
        '<Card className="relative ',
        1
    )
}

if ($dashboard -notmatch '<Card\s+className="[^"]*overflow-hidden') {
    $dashboard = [regex]::Replace(
        $dashboard,
        '<Card\s+className="',
        '<Card className="overflow-hidden ',
        1
    )
}

# Reserva espacio a la derecha desde pantallas medianas para que la foto no tape el texto.
$dashboard = [regex]::Replace(
    $dashboard,
    '<section\s+className="(?![^"]*md:pr-72)([^"]*)"',
    '<section className="$1 md:pr-72 lg:pr-80"',
    1
)

$dashboardPhoto = @'

      {/* FOTO EXCLUSIVA DEL DASHBOARD: INICIO */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-4 z-20 hidden h-[94%] w-[250px] items-end justify-center md:flex lg:right-8 lg:w-[300px]"
      >
        <Image
          src="/images/profe-armando-hero.png"
          alt=""
          width={320}
          height={520}
          priority
          className="h-full w-auto object-contain object-bottom drop-shadow-[0_14px_18px_rgba(0,0,0,0.28)]"
        />
      </div>
      {/* FOTO EXCLUSIVA DEL DASHBOARD: FIN */}
'@

$lastCardClose = $dashboard.LastIndexOf('</Card>')
if ($lastCardClose -lt 0) {
    throw "No se encontro el cierre </Card> en DashboardHero.tsx"
}
$dashboard = $dashboard.Insert($lastCardClose, $dashboardPhoto)
Write-Utf8File $dashboardPath $dashboard

# 2. Eliminar la fotografia personal del Hero de Profe IA.
# El robot /images/profe-ia-robot.png se conserva.
$aiHero = Read-Utf8File $aiHeroPath
$aiHero = [regex]::Replace(
    $aiHero,
    '(?s)\s*\{\/\*\s*Profesor Armando\s*\*\/\}\s*<div[^>]*>\s*<Image\s+[^>]*src=["'']/images/profe-armando-hero\.png["''][^>]*/>\s*</div>',
    ''
)
$aiHero = [regex]::Replace(
    $aiHero,
    '(?s)\s*<div[^>]*>\s*<Image\s+[^>]*src=["'']/images/profe-armando-hero\.png["''][^>]*/>\s*</div>',
    ''
)

# Pasa la cuadricula de tres columnas a dos, ya sin la fotografia personal.
$aiHero = $aiHero.Replace(
    'lg:grid-cols-[190px_minmax(0,1fr)_220px]',
    'lg:grid-cols-[190px_minmax(0,1fr)]'
)
$aiHero = $aiHero.Replace(
    'print:grid-cols-[120px_minmax(0,1fr)_150px]',
    'print:grid-cols-[120px_minmax(0,1fr)]'
)
Write-Utf8File $aiHeroPath $aiHero

# 3. Verificacion final obligatoria.
$dashboardCheck = Read-Utf8File $dashboardPath
$aiCheck = Read-Utf8File $aiHeroPath

if ($dashboardCheck -notmatch 'FOTO EXCLUSIVA DEL DASHBOARD' -or
    $dashboardCheck -notmatch '/images/profe-armando-hero\.png') {
    throw "No se pudo instalar la fotografia en DashboardHero.tsx"
}

if ($aiCheck -match '/images/profe-armando-hero\.png') {
    throw "La fotografia personal todavia aparece en AIHero.tsx"
}

if ($aiCheck -notmatch '/images/profe-ia-robot\.png') {
    throw "Se detecto un problema: el robot de Profe IA no esta presente"
}

Write-Host "Correccion completada correctamente." -ForegroundColor Green
Write-Host "- Fotografia personal: solamente en el Hero del Dashboard." -ForegroundColor Green
Write-Host "- Hero de Profe IA: fotografia eliminada; robot conservado." -ForegroundColor Green
Write-Host "Ahora ejecuta: npm run lint" -ForegroundColor Cyan

