import { ACCENT, priceFormatter } from "../../utils/priceHistory";
import { StoreKey } from "./StoreBadges";

function StatBox({ label, value, store, accent }) {
  return (
    <div className="rounded-xl border border-white/10 px-4 py-3">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p
        className="mt-1 text-lg font-bold tabular-nums"
        style={{ color: accent ? ACCENT : "#f1f5f9" }}
      >
        {value}
      </p>
      {store && (
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
          <StoreKey store={store} />
          {store}
        </p>
      )}
    </div>
  );
}

// Cartões de menor preço, maior preço e diferença
function PriceSummary({ lowest, highest, hasComparison }) {
  return (
    <div className={`mt-5 grid gap-3 ${hasComparison ? "grid-cols-3" : "grid-cols-1"}`}>
      <StatBox
        label={hasComparison ? "Menor preço agora" : "Preço agora"}
        value={priceFormatter.format(lowest.price)}
        store={lowest.store}
        accent
      />
      {hasComparison && (
        <>
          <StatBox
            label="Maior preço agora"
            value={priceFormatter.format(highest.price)}
            store={highest.store}
          />
          <StatBox
            label="Diferença"
            value={priceFormatter.format(highest.price - lowest.price)}
          />
        </>
      )}
    </div>
  );
}

export default PriceSummary;