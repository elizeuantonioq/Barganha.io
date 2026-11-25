import { ACCENT, PRICE_UP, fullDateFormatter, priceFormatter } from "../../utils/priceHistory";
import { StoreKey } from "./StoreBadges";

// Tabela com todos os registros de preço, do mais novo para o mais antigo
function HistoryTable({ stores }) {
  const rows = stores
    .flatMap((store) =>
      store.points.map((point, index) => ({
        ...point,
        store: store.store,
        change: index > 0 ? point.price - store.points[index - 1].price : null,
      })),
    )
    .sort((first, second) => second.time - first.time);

  return (
    <div className="max-h-64 overflow-y-auto">
      <table className="w-full text-left text-xs">
        <caption className="sr-only">Registros de preço por loja</caption>
        <thead className="sticky top-0 bg-[#0d1117] text-[11px] text-slate-500">
          <tr>
            <th className="py-2 pr-4 font-normal">Data</th>
            <th className="py-2 pr-4 font-normal">Loja</th>
            <th className="py-2 pr-4 text-right font-normal">Preço</th>
            <th className="py-2 text-right font-normal">Variação</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map((row) => (
            <tr key={`${row.store}-${row.time}`} className="border-t border-white/5">
              <td className="py-2 pr-4 text-slate-400">{fullDateFormatter.format(row.time)}</td>
              <td className="py-2 pr-4">
                <span className="flex items-center gap-2 text-slate-300">
                  <StoreKey store={row.store} />
                  {row.store}
                </span>
              </td>
              <td className="py-2 pr-4 text-right font-bold text-slate-100">
                {priceFormatter.format(row.price)}
              </td>
              <td className="py-2 text-right">
                {row.change == null || row.change === 0 ? (
                  <span className="text-slate-500">—</span>
                ) : (
                  <span style={{ color: row.change < 0 ? ACCENT : PRICE_UP }}>
                    {row.change < 0 ? "▼" : "▲"} {priceFormatter.format(Math.abs(row.change))}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HistoryTable;