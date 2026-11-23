import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchPriceHistory } from "../services/offers";

const LINE_COLORS = ["#b8f22d", "#38bdf8", "#f472b6", "#fbbf24"];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function PriceHistoryChart({ productId }) {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchPriceHistory(productId)
      .then((result) => {
        if (active) setStores(result);
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

  if (isLoading) {
    return <p className="mt-5 text-xs text-slate-500">Carregando histórico...</p>;
  }

  if (error) {
    return <p className="mt-5 text-xs text-red-400">{error}</p>;
  }

  if (stores.length === 0) {
    return <p className="mt-5 text-xs text-slate-500">Ainda não há histórico de preços.</p>;
  }

  return (
    <div className="mt-5">
      <p className="mb-3 font-['DM_Mono'] text-xs uppercase text-[#b8f22d]">
        Histórico de preços
      </p>
      <div className="h-64 border border-white/10 bg-[#0d1117] p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" />
            <XAxis
              dataKey="time"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(time) => dateFormatter.format(time)}
              stroke="#64748b"
              fontSize={11}
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(price) => priceFormatter.format(price)}
              stroke="#64748b"
              fontSize={11}
              width={90}
            />
            <Tooltip
              labelFormatter={(time) => dateFormatter.format(time)}
              formatter={(price) => priceFormatter.format(price)}
              contentStyle={{
                background: "#111722",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            />
            <Legend />
            {stores.map((store, index) => (
              <Line
                key={store.store}
                data={store.points}
                dataKey="price"
                name={store.store}
                type="stepAfter"
                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PriceHistoryChart;