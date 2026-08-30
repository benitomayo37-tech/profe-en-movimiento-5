"use client";

export function CertificatePrintButton() {
  return <button onClick={() => window.print()} className="academy-no-print rounded-xl bg-orange-500 px-6 py-3 font-black text-white shadow-lg hover:bg-orange-600">Imprimir o guardar en PDF</button>;
}
