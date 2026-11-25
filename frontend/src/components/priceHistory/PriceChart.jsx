import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  GRID,
  MUTED,
  SURFACE,
  axisPriceFormatter,
  storeColor,
} from "../../utils/priceHistory";
import ChartTooltip from "./ChartTooltip";

// O gráfico em si: uma linha em degrau por loja
function PriceChart({ productId, chart, stores }) {
  const { rows, current, timeTicks, priceTicks } = chart;
  const lastIndex = rows.length - 1;
  const lowest = current[0];
  const hasComparison = current.length > 1;
  const gradientId = `lowest-fill-${productId}`;

  // A loja mais barata é desenhada por último (por cima) e ganha a área preenchida.
  const drawOrder = [...current].reverse().map((item) => item.store);

  return (
    <div className="mt-5 h-56 [&_*:focus]:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={storeColor(lowest.store)} stopOpacity={0.22} />
              <stop offset="100%" stopColor={storeColor(lowest.store)} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID} strokeDasharray="4 4" />
          <XAxis
            dataKey="time"
            type="number"
            domain={["dataMin", "dataMax"]}
            ticks={[...timeTicks.keys()]}
            tickFormatter={(time) => timeTicks.get(time) ?? ""}
            padding={{ left: 16, right: 16 }}
            axisLine={false}
            tickLine={false}
            tick={{ fill: MUTED, fontSize: 12 }}
            tickMargin={12}
            minTickGap={24}
          />
          <YAxis
            type="number"
            domain={[priceTicks[0], priceTicks.at(-1)]}
            ticks={priceTicks}
            tickFormatter={(price) => axisPriceFormatter.format(price)}
            axisLine={false}
            tickLine={false}
            tick={{ fill: MUTED, fontSize: 12 }}
            width={56}
          />
          <Tooltip
            content={<ChartTooltip stores={stores} />}
            cursor={{ stroke: "rgba(255, 255, 255, 0.15)", strokeWidth: 1 }}
          />
          {hasComparison && (
            <Area
              dataKey={(row) => row.line[lowest.store]}
              connectNulls
              type="stepAfter"
              baseValue={priceTicks[0]}
              stroke="none"
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              activeDot={false}
              tooltipType="none"
              legendType="none"
            />
          )}
          {drawOrder.map((store) => {
            const color = storeColor(store);
            const isLowest = store === lowest.store;

            return (
              <Line
                key={store}
                dataKey={(row) => row.line[store]}
                connectNulls
                name={store}
                type="stepAfter"
                stroke={color}
                strokeWidth={isLowest ? 2.75 : 2}
                strokeLinejoin="round"
                isAnimationActive={false}
                dot={({ cx, cy, index, payload }) => {
                  if (cx == null || cy == null) return null;
                  const isLast = index === lastIndex;
                  if (!isLast && payload.synthetic) return null;

                  return (
                    <circle
                      key={`${store}-${index}`}
                      cx={cx}
                      cy={cy}
                      r={isLast ? 6 : 4}
                      fill={color}
                      stroke={SURFACE}
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 6, fill: color, stroke: SURFACE, strokeWidth: 2 }}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceChart;