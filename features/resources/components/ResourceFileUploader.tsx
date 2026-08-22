"use client";

import { useState } from "react";
import * as tus from "tus-js-client";

import { createClient } from "@/lib/supabase/client";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

interface ResourceFileUploaderProps {
  initialValue?: string;
  initialPremium?: boolean;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const acceptedExtensions = ".pdf,.docx,.xlsx,.pptx,.zip";

function safeFileName(fileName: string) {
  const normalized = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "recurso.pdf";
}

function contentTypeFor(file: File) {
  if (file.type) return file.type;
  const extension = file.name.toLowerCase().split(".").pop();
  const types: Record<string, string> = {
    pdf: "application/pdf",
    zip: "application/zip",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  return types[extension ?? ""] ?? "application/octet-stream";
}

async function uploadResumable(
  file: File,
  bucket: string,
  path: string,
  onProgress: (percentage: number) => void,
) {
  const supabase = createClient();
  const config = getSupabasePublicConfig();
  if (!supabase || !config) throw new Error("Supabase no está configurado");

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("La sesión administrativa no está disponible. Recarga la página");
  }

  const projectId = new URL(config.url).hostname.split(".")[0];
  if (!projectId) throw new Error("No se pudo identificar el proyecto de Storage");

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000],
      headers: {
        authorization: `Bearer ${data.session.access_token}`,
        "x-upsert": "false",
      },
      uploadDataDuringCreation: false,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: bucket,
        objectName: path,
        contentType: contentTypeFor(file),
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024,
      onError(uploadError) {
        reject(uploadError);
      },
      onProgress(bytesUploaded, bytesTotal) {
        onProgress(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess() {
        resolve();
      },
    });

    void upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length > 0) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      upload.start();
    }).catch(reject);
  });
}

export default function ResourceFileUploader({
  initialValue = "",
  initialPremium = false,
}: ResourceFileUploaderProps) {
  const [downloadUrl, setDownloadUrl] = useState(initialValue);
  const [premium, setPremium] = useState(initialPremium);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  function changeAccess(nextPremium: boolean) {
    setPremium(nextPremium);
    if (downloadUrl.startsWith("storage://")) {
      setDownloadUrl("");
      setMessage("Selecciona nuevamente el archivo para guardarlo con el acceso elegido.");
    }
  }

  async function uploadFile(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setMessage("El archivo supera el límite de 20 MB.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setMessage("Supabase no está configurado.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage("Preparando archivo...");
    const bucket = premium ? "recursos-premium" : "recursos-publicos";
    const path = `biblioteca/${crypto.randomUUID()}-${safeFileName(file.name)}`;

    try {
      await uploadResumable(file, bucket, path, (percentage) => {
        setProgress(percentage);
        setMessage(`Subiendo archivo: ${percentage}%`);
      });

      setDownloadUrl(`storage://${bucket}/${path}`);
      setProgress(100);
      setMessage(premium ? "Archivo Premium protegido y listo para guardar." : "Archivo público listo para guardar.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Error de conexión con Storage";
      setDownloadUrl("");
      setProgress(0);
      setMessage(`No se pudo subir el archivo: ${detail}. Intenta nuevamente.`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm font-black text-slate-950">Archivo descargable</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">Sube PDF, Word, Excel, PowerPoint o ZIP. Tamaño máximo: 20 MB.</p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold">
        <label className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 ${!premium ? "border-emerald-400 bg-white text-emerald-700" : "border-slate-200 bg-white text-slate-600"}`}>
          <input type="radio" name="fileAccess" checked={!premium} onChange={() => changeAccess(false)} />
          Gratuito
        </label>
        <label className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 ${premium ? "border-violet-400 bg-white text-violet-700" : "border-slate-200 bg-white text-slate-600"}`}>
          <input type="radio" name="fileAccess" checked={premium} onChange={() => changeAccess(true)} />
          Premium
        </label>
      </div>

      <input type="hidden" name="premium" value={premium ? "on" : ""} />
      <input type="hidden" name="downloadUrl" value={downloadUrl} />

      <label className="mt-4 block text-sm font-bold text-slate-800">
        Seleccionar archivo
        <input
          key={premium ? "premium-file" : "public-file"}
          type="file"
          accept={acceptedExtensions}
          disabled={uploading}
          onChange={(event) => void uploadFile(event.target.files?.[0])}
          className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-700 file:px-3 file:py-2 file:font-bold file:text-white"
        />
      </label>

      <label className="mt-4 block text-sm font-bold text-slate-800">
        O pegar una URL externa
        <input
          type="url"
          value={downloadUrl.startsWith("storage://") ? "" : downloadUrl}
          onChange={(event) => setDownloadUrl(event.target.value)}
          placeholder="https://..."
          className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3"
        />
      </label>

      {downloadUrl.startsWith("storage://") ? <p className="mt-3 break-all rounded-lg bg-white p-3 text-xs font-semibold text-slate-600">Archivo almacenado: {downloadUrl.split("/").at(-1)}</p> : null}
      {uploading ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div> : null}
      <p aria-live="polite" className={`mt-3 min-h-5 text-xs font-bold ${message.includes("No se pudo") || message.includes("supera") ? "text-red-700" : "text-blue-700"}`}>{message}</p>
    </section>
  );
}
