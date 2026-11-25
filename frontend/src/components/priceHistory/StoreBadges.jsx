import { storeColor } from "../../utils/priceHistory";

// Bolinha com a cor da loja
export function StoreKey({ store }) {
  return (
    <span
      className="h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ background: storeColor(store) }}
    />
  );
}

// Etiqueta "Menor" ou "Maior" ao lado do preço
export function PriceTag({ kind }) {
  if (kind === "lowest") {
    return (
      <span className="rounded bg-[#b8f22d]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#b8f22d]">
        Menor
      </span>
    );
  }

  if (kind === "highest") {
    return (
      <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-400">
        Maior
      </span>
    );
  }

  return null;
}

export function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}