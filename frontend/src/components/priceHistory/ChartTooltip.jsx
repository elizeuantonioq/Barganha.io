import { fullDateFormatter, priceFormatter, pricesIn, tagFor } from "../../utils/priceHistory";
import { PriceTag, StoreKey } from "./StoreBadges";

// Caixinha que aparece ao passar o mouse no gráfico
function ChartTooltip({ active, payload, stores }) {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload;
  const items = pricesIn(row, stores);

  return (
    <div className="min-w-56 rounded-lg border border-white/10 bg-[#161c26] px-3 py-2.5 shadow-xl shadow-black/40">
      <p className="mb-2 text-[11px] text-slate-400">
        {row.isNow ? "Agora" : fullDateFormatter.format(row.time)}
      </p>
      <ul className="grid gap-1.5">
        {items.map((item, index) => (
          <li key={item.store} className="flex items-center gap-2">
            <StoreKey store={item.store} />
            <span className="text-xs text-slate-300">{item.store}</span>
            <span className="ml-auto pl-3 text-sm font-bold tabular-nums text-slate-100">
              {priceFormatter.format(item.price)}
            </span>
            <span className="w-12 text-right">
              <PriceTag kind={tagFor(index, items.length)} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChartTooltip;