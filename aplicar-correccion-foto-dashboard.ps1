$ErrorActionPreference = "Stop"

$target = Join-Path $PSScriptRoot "features\dashboard\components\DashboardHero.tsx"

if (-not (Test-Path $target)) {
  throw "No se encontro DashboardHero.tsx. Copie esta carpeta dentro de la raiz del proyecto antes de ejecutar el instalador."
}

$content = Get-Content -Path $target -Raw

if ($content.Contains('src="/images/profe-armando-hero.png"')) {
  Write-Host "La fotografia ya esta instalada en el Hero del Dashboard." -ForegroundColor Green
  exit 0
}

if (-not $content.Contains('import Image from "next/image";')) {
  $firstImport = $content.IndexOf("import ")

  if ($firstImport -lt 0) {
    throw "No se encontro el bloque de importaciones de DashboardHero.tsx."
  }

  $content = $content.Insert($firstImport, 'import Image from "next/image";' + [Environment]::NewLine)
}

$cardRegex = [regex]::new('<Card className="(?![^"]*\brelative\b)')
$content = $cardRegex.Replace($content, '<Card className="relative ', 1)

$sectionRegex = [regex]::new('<section className="(?![^"]*\bz-10\b)')
$content = $sectionRegex.Replace(
  $content,
  '<section className="relative z-10 md:pr-64 lg:pr-80 ',
  1
)

$photoBlock = @'

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-64 items-end justify-center md:flex lg:w-80">
        <div className="absolute inset-0 bg-gradient-to-l from-blue-500/20 via-blue-400/5 to-transparent" />
        <Image
          src="/images/profe-armando-hero.png"
          alt="Profesor Armando"
          width={320}
          height={520}
          priority
          className="relative z-10 max-h-[255px] w-auto object-contain object-bottom lg:max-h-[310px]"
        />
      </div>
'@

$closingCard = $content.LastIndexOf("</Card>")

if ($closingCard -lt 0) {
  throw "No se encontro el cierre del componente Card en DashboardHero.tsx."
}

$content = $content.Insert($closingCard, $photoBlock)
Set-Content -Path $target -Value $content -Encoding utf8

Write-Host "Fotografia instalada correctamente en el Hero del Dashboard." -ForegroundColor Green
