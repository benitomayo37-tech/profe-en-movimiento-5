"use client";

interface CertificateImageButtonProps {
  courseTitle: string;
  date: string;
  duration: string;
  instructor: string;
  participant: string;
  score: number;
}

const NAVY = "#0b2050";
const ORANGE = "#fc7000";
const MUTED = "#64748b";

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function drawContained(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function setFittedFont(context: CanvasRenderingContext2D, text: string, maximumWidth: number, initialSize: number, weight = 800) {
  let size = initialSize;
  do {
    context.font = `${weight} ${size}px Arial, Helvetica, sans-serif`;
    size -= 2;
  } while (context.measureText(text).width > maximumWidth && size > 28);
}

export function CertificateImageButton({ courseTitle, date, duration, instructor, participant, score }: CertificateImageButtonProps) {
  async function saveAsImage() {
    const button = document.activeElement as HTMLButtonElement | null;
    if (button) button.disabled = true;

    try {
      const [logo, signature, seal] = await Promise.all([
        loadImage("/logos/logo-profe-en-movimiento.png"),
        loadImage("/images/firma-armando-mayo.png"),
        loadImage("/images/sello-academia-profe-en-movimiento.svg"),
      ]);
      const canvas = document.createElement("canvas");
      canvas.width = 2480;
      canvas.height = 1754;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("No se pudo preparar la imagen.");

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = NAVY;
      context.lineWidth = 18;
      context.strokeRect(20, 20, 2440, 1714);
      context.lineWidth = 5;
      context.strokeRect(40, 40, 2400, 1674);
      context.textAlign = "center";
      context.textBaseline = "middle";

      drawContained(context, logo, 1100, 70, 280, 210);
      context.fillStyle = ORANGE;
      context.font = "800 30px Arial, Helvetica, sans-serif";
      context.fillText("A C A D E M I A   P R O F E   E N   M O V I M I E N T O", 1240, 315);

      context.fillStyle = NAVY;
      setFittedFont(context, "Certificado de finalización", 2000, 100, 900);
      context.fillText("Certificado de finalización", 1240, 430);
      context.font = "400 40px Arial, Helvetica, sans-serif";
      context.fillText("Se certifica que", 1240, 545);

      setFittedFont(context, participant, 1700, 76, 900);
      context.fillText(participant, 1240, 650);
      context.strokeStyle = ORANGE;
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(520, 705);
      context.lineTo(1960, 705);
      context.stroke();

      context.font = "400 38px Arial, Helvetica, sans-serif";
      context.fillText("completó satisfactoriamente el curso", 1240, 800);
      setFittedFont(context, courseTitle, 1900, 68, 900);
      context.fillText(courseTitle, 1240, 900);
      context.font = "400 34px Arial, Helvetica, sans-serif";
      context.fillText(`Duración: ${duration} · Evaluación final: ${score}%`, 1240, 995);

      drawContained(context, signature, 1060, 1040, 360, 260);
      context.strokeStyle = MUTED;
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(865, 1295);
      context.lineTo(1615, 1295);
      context.stroke();
      context.fillStyle = NAVY;
      context.font = "900 33px Arial, Helvetica, sans-serif";
      context.fillText(instructor, 1240, 1340);
      context.font = "400 25px Arial, Helvetica, sans-serif";
      context.fillText("Autor e instructor", 1240, 1380);
      context.fillStyle = MUTED;
      context.font = "400 21px Arial, Helvetica, sans-serif";
      context.fillText(`Fecha de finalización: ${date}`, 1240, 1418);

      drawContained(context, seal, 2050, 1270, 260, 260);
      context.fillStyle = NAVY;
      context.font = "800 20px Arial, Helvetica, sans-serif";
      context.fillText("PROFE EN MOVIMIENTO · EDUCACIÓN FÍSICA, DEPORTE Y SALUD", 1240, 1575);
      context.fillStyle = MUTED;
      context.font = "400 16px Arial, Helvetica, sans-serif";
      context.fillText("Constancia interna de finalización. No equivale a una titulación o acreditación oficial.", 1240, 1620);

      const link = document.createElement("a");
      link.download = `certificado-${participant.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "participante"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      window.alert("No fue posible guardar la imagen. Inténtalo nuevamente.");
    } finally {
      if (button) button.disabled = false;
    }
  }

  return <button onClick={saveAsImage} className="academy-image-download-button academy-no-print rounded-xl border px-6 py-3 font-black shadow-lg disabled:opacity-60">Guardar como imagen</button>;
}
