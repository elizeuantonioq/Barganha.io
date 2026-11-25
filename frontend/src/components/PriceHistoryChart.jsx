import { useEffect, useMemo, useState } from "react";
import { fetchPriceHistory } from "../services/offers";
import {
  PERIODS,
  VERDICT_STYLES,
  buildChart,
  buildRows,
  priceFormatter,
  tagFor,
} from "../utils/priceHistory";
import HistoryTable from "./priceHistory/HistoryTable";
import PeriodSelector from "./priceHistory/PeriodSelector";
import PriceChart from "./priceHistory/PriceChart";
import PriceSummary from "./priceHistory/PriceSummary";
import { ClockIcon, PriceTag, StoreKey } from "./priceHistory/StoreBadges";

function Card({ productName, children }) {
  return (
    <section
      className="mt-6 rounded-2xl border border-white/10 bg-[#0d1117] p-6"
      aria-label="Histórico de preços"
    >
      {productName && <p className="text-sm text-slate-400">{productName}</p>}
      {children}
    </section>
  );
}

function PriceHistoryChart({ productId, productName }) {
  const [history, setHistory] = useState({ stores: [], loadedAt: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [periodId, setPeriodId] = useState("90d");
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    let active = true;

    fetchPriceHistory(productId)
      .then((result) => {
        if (active) {
          setHistory({
            stores: result.filter((store) => store.points.length > 0),
            loadedAt: Date.now(),
          });
        }
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar o histórico de preços.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId]);

  const { stores, loadedAt } = history;
  const period = PERIODS.find((item) => item.id === periodId);
  const allRows = useMemo(() => buildRows(stores), [stores]);
  const chart = useMemo(
    () => buildChart(allRows, stores, loadedAt, period),
    [allRows, stores, loadedAt, period],
  );

  if (isLoading || error || !chart) {
    return (
      <Card productName={productName}>
        <p className={`mt-2 text-xs ${error ? "text-red-400" : "text-slate-500"}`}>
          {error || (isLoading ? "Carregando histórico..." : "Ainda não há histórico de preços.")}
        </p>
      </Card>
    );
  }

  const { current, verdict } = chart;
  const verdictStyle = VERDICT_STYLES[verdict.tone];
  const tableLabel = showTable ? "Ver gráfico" : "Ver todos os registros";

  return (
    <Card productName={productName}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="mt-1 text-xl font-bold text-slate-100">Está realmente barato?</h3>
          <p className="mt-1.5 text-xs text-slate-400">
            <span className="mr-1.5 font-bold" style={{ color: verdictStyle.color }}>
              {verdictStyle.icon}
            </span>
            {verdict.text}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((value) => !value)}
          aria-pressed={showTable}
          aria-label={tableLabel}
          title={tableLabel}
          className={`shrink-0 rounded-lg p-2 transition ${
            showTable
              ? "bg-[#b8f22d] text-[#0d1117]"
              : "bg-[#b8f22d]/10 text-[#b8f22d] hover:bg-[#b8f22d]/20"
          }`}
        >
          <ClockIcon />
        </button>
      </div>

      <PriceSummary
        lowest={current[0]}
        highest={current.at(-1)}
        hasComparison={current.length > 1}
      />

      {showTable ? (
        <div className="mt-5">
          <HistoryTable stores={stores} />
        </div>
      ) : (
        <>
          <PeriodSelector periodId={periodId} onChange={setPeriodId} />
          <PriceChart productId={productId} chart={chart} stores={stores} />
        </>
      )}

      <div className="mt-5 border-t border-white/10 pt-4">
        <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Lojas">
          {current.map((item, index) => (
            <li key={item.store} className="flex items-center gap-2 text-sm">
              <StoreKey store={item.store} />
              <span className="text-slate-300">{item.store}</span>
              <span className="font-bold tabular-nums text-slate-100">
                {priceFormatter.format(item.price)}
              </span>
              <PriceTag kind={tagFor(index, current.length)} />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-slate-500">Preços encontrados pelo Barganha.io</p>
      </div>
    </Card>
  );
}

export default PriceHistoryChart;