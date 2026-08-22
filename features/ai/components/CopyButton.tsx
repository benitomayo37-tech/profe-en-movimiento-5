interface CopyButtonProps {
  onCopy: () => void | Promise<void>;
}

export default function CopyButton({
  onCopy,
}: CopyButtonProps) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-100"
    >
      <span aria-hidden="true">📋</span> Copiar resultado
    </button>
  );
}
