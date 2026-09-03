import Link from "next/link";

interface HotmartPurchaseButtonProps {
  productId: string;
  compact?: boolean;
  source?: string;
}

export default function HotmartPurchaseButton({
  productId,
  compact = false,
  source,
}: HotmartPurchaseButtonProps) {
  const query = new URLSearchParams({ product: productId });
  if (source) query.set("source", source);
  return (
    <Link
      href={`/checkout?${query.toString()}`}
      className={compact
        ? "inline-flex min-h-10 items-center justify-center rounded-xl border border-orange-500 bg-orange-50 px-4 py-2 text-xs font-black text-orange-700 transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
        : "flex min-h-12 w-full items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-center font-black text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-100"
      }
    >
      Comprar con Hotmart
      <span className="ml-2" aria-hidden="true">→</span>
    </Link>
  );
}
