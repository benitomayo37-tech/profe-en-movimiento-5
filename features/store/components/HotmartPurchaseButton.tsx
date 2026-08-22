import Link from "next/link";

interface HotmartPurchaseButtonProps {
  productId: string;
  compact?: boolean;
}

export default function HotmartPurchaseButton({
  productId,
  compact = false,
}: HotmartPurchaseButtonProps) {
  return (
    <Link
      href={`/checkout?product=${encodeURIComponent(productId)}`}
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
