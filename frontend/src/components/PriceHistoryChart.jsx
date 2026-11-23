import { useEffect, useMemo, useState } from "react";
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
import { fetchPriceHistory } from "../services/offers";

const ACCENT = "#b8f22d";
const SURFACE = "#0d1117";
const GRID = "rgba(255, 255, 255, 0.07)";
const MUTED = "#7d8590";
const PRICE_UP = "#ec835a";

// Cada loja tem sempre a mesma cor, independente da ordem ou de quais lojas
// aparecem no produto. Paleta validada para daltonismo no fundo escuro; o nome
// da loja na legenda e no tooltip é a codificação secundária.
const STORE_COLORS = {
    Amazon: "#3987e5",
    "KaBuM!": "#d95926",
    Magalu: "#199e70",
    "Mercado Livre": "#c98500",
};
const FALLBACK_COLORS = ["#d55181", "#0ca30c", "#9085e9", "#e66767"];

function storeColor(store) {
    if (STORE_COLORS[store]) return STORE_COLORS[store];

    const hash = [...store].reduce((total, char) => total + char.charCodeAt(0), 0);
    return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

const PERIODS = [
    { id: "30d", label: "30 dias", days: 30 },
    { id: "90d", label: "90 dias", days: 90 },
    { id: "1y", label: "1 ano", days: 365 },
];

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

const priceFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const axisPriceFormatter = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
});

const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

const shortDayFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
});

const hourFormatter = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
});

const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });

const formatMonth = (time) => {
    const month = monthFormatter.format(time).replace(".", "");
    return month.charAt(0).toUpperCase() + month.slice(1);
};

// Os rótulos vão até o minuto: agrupar por minuto evita pontos repetidos
// (ex.: lojas registradas com milissegundos de diferença).
const toMinute = (time) => Math.floor(time / MINUTE) * MINUTE;

/**
 * Uma linha por minuto com registro.
 * - `prices`: último preço conhecido de cada loja (o preço vale até mudar),
 *   usado no tooltip e nos resumos.
 * - `line`: só os preços registrados naquele minuto; cada loja liga apenas os
 *   próprios registros no gráfico.
 */
function buildRows(stores) {
    const times = [
        ...new Set(stores.flatMap((store) => store.points.map((point) => toMinute(point.time)))),
    ].sort((first, second) => first - second);

    return times.map((time) => {
        const row = { time, prices: {}, line: {} };

        stores.forEach((store) => {
            const lastPoint = store.points
                .filter((point) => toMinute(point.time) <= time)
                .at(-1);

            if (lastPoint) {
                row.prices[store.store] = lastPoint.price;
                if (toMinute(lastPoint.time) === time) {
                    row.line[store.store] = lastPoint.price;
                }
            }
        });

        return row;
    });
}

/**
 * Recorta as linhas para o período escolhido. Os preços que valiam no início
 * do período e os preços atuais entram como linhas extras (sem marcador),
 * para as linhas do gráfico cobrirem o período todo.
 */
function sliceRows(rows, windowStart, now) {
    const before = rows.filter((row) => row.time < windowStart).at(-1);
    const sliced = rows.filter((row) => row.time >= windowStart);

    if (before) {
        sliced.unshift({
            time: windowStart,
            prices: before.prices,
            line: { ...before.prices },
            synthetic: true,
        });
    }

    const last = sliced.at(-1);
    const nowTime = toMinute(now);

    if (last && nowTime > last.time) {
        sliced.push({
            time: nowTime,
            prices: last.prices,
            line: { ...last.prices },
            synthetic: true,
            isNow: true,
        });
    }

    return sliced;
}

function pricesIn(row, stores) {
    return stores
        .filter((store) => row.prices[store.store] != null)
        .map((store) => ({ store: store.store, price: row.prices[store.store] }))
        .sort((first, second) => first.price - second.price);
}

// Escala do eixo Y com valores redondos e uma folga acima e abaixo das linhas.
function buildPriceTicks(prices) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const rawStep = Math.max(max - min, max * 0.05) / 3;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const step =
        [1, 2, 2.5, 5, 10].find((factor) => factor * magnitude >= rawStep) * magnitude;

    let lower = Math.floor(min / step) * step;
    let upper = Math.ceil(max / step) * step;
    if (min - lower < step / 4) lower -= step;
    if (upper - max < step / 4) upper += step;

    const ticks = [];
    for (let tick = Math.max(lower, 0); tick <= upper + step / 2; tick += step) {
        ticks.push(Math.round(tick * 100) / 100);
    }
    return ticks;
}

// Marcos do eixo X sempre em pontos reais (os mesmos que o tooltip mostra),
// sem repetir rótulo: no modo mês fica só o primeiro ponto de cada mês.
function buildTimeTicks(rows) {
    const span = rows.at(-1).time - rows[0].time;
    const format = (row) => {
        if (span >= 60 * DAY) return formatMonth(row.time);
        if (span >= DAY) return shortDayFormatter.format(row.time);
        return row.isNow ? "Agora" : hourFormatter.format(row.time);
    };

    const labels = new Map();
    rows.forEach((row) => {
        const label = format(row);
        if (![...labels.values()].includes(label)) {
            labels.set(row.time, label);
        }
    });

    return labels;
}

// Média do menor preço ponderada pelo tempo que cada preço durou.
function averagePrice(points) {
    let weighted = 0;
    let total = 0;

    points.slice(0, -1).forEach((point, index) => {
        const duration = points[index + 1].time - point.time;
        weighted += point.price * duration;
        total += duration;
    });

    return total > 0 ? weighted / total : points[0].price;
}

function buildVerdict(rows, stores, period, windowStart) {
    const points = rows.map((row) => ({
        time: row.time,
        price: pricesIn(row, stores)[0].price,
    }));
    const current = points.at(-1).price;
    const prices = points.map((point) => point.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const dataStart = points[0].time;
    const periodText =
        dataStart > windowStart
            ? `desde ${shortDayFormatter.format(dataStart)}`
            : `nos últimos ${period.days} dias`;

    if (min === max) {
        return {
            tone: "neutral",
            text: `Menor preço estável ${periodText}. Ainda não há variações para comparar.`,
        };
    }

    const average = averagePrice(points);

    if (current <= min) {
        return { tone: "good", text: `Sim! É o menor preço ${periodText}.` };
    }

    if (current < average) {
        return {
            tone: "good",
            text: `Bom preço: abaixo da média de ${priceFormatter.format(average)} ${periodText}.`,
        };
    }

    return {
        tone: "bad",
        text: `Ainda não: acima da média de ${priceFormatter.format(average)} ${periodText}.`,
    };
}

const VERDICT_STYLES = {
    good: { icon: "✓", color: ACCENT },
    neutral: { icon: "•", color: "#94a3b8" },
    bad: { icon: "▲", color: PRICE_UP },
};

function ClockIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    );
}

function PriceTag({ kind }) {
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

function tagFor(index, total) {
    if (total < 2) return null;
    if (index === 0) return "lowest";
    if (index === total - 1) return "highest";
    return null;
}

function StoreKey({ store }) {
    return (
        <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: storeColor(store) }}
        />
    );
}

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
                            <td className="py-2 pr-4 text-slate-400">
                                {fullDateFormatter.format(row.time)}
                            </td>
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
                                        {row.change < 0 ? "▼" : "▲"}{" "}
                                        {priceFormatter.format(Math.abs(row.change))}
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

    const chart = useMemo(() => {
        if (allRows.length === 0) return null;

        const windowStart = toMinute(loadedAt - period.days * DAY);
        const rows = sliceRows(allRows, windowStart, loadedAt);
        const current = pricesIn(rows.at(-1), stores);
        const allPrices = rows.flatMap((row) => pricesIn(row, stores).map((item) => item.price));

        return {
            rows,
            current,
            timeTicks: buildTimeTicks(rows),
            priceTicks: buildPriceTicks(allPrices),
            verdict: buildVerdict(rows, stores, period, windowStart),
        };
    }, [allRows, stores, loadedAt, period]);

    if (isLoading || error || !chart) {
        return (
            <Card productName={productName}>
                <p className={`mt-2 text-xs ${error ? "text-red-400" : "text-slate-500"}`}>
                    {error ||
                        (isLoading ? "Carregando histórico..." : "Ainda não há histórico de preços.")}
                </p>
            </Card>
        );
    }

    const { rows, current, timeTicks, priceTicks, verdict } = chart;
    const verdictStyle = VERDICT_STYLES[verdict.tone];
    const lastIndex = rows.length - 1;
    const lowest = current[0];
    const highest = current.at(-1);
    const hasComparison = current.length > 1;

    // A loja mais barata é desenhada por último (por cima) e ganha a área preenchida.
    const drawOrder = [...current].reverse().map((item) => item.store);

    return (
        <Card productName={productName}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="mt-1 text-xl font-bold text-slate-100">
                        Está realmente barato?
                    </h3>
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
                    aria-label={showTable ? "Ver gráfico" : "Ver todos os registros"}
                    title={showTable ? "Ver gráfico" : "Ver todos os registros"}
                    className={`shrink-0 rounded-lg p-2 transition ${
                        showTable
                            ? "bg-[#b8f22d] text-[#0d1117]"
                            : "bg-[#b8f22d]/10 text-[#b8f22d] hover:bg-[#b8f22d]/20"
                    }`}
                >
                    <ClockIcon />
                </button>
            </div>

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

            {showTable ? (
                <div className="mt-5">
                    <HistoryTable stores={stores} />
                </div>
            ) : (
                <>
                    <div className="mt-5 flex gap-2" role="group" aria-label="Período">
                        {PERIODS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setPeriodId(item.id)}
                                aria-pressed={periodId === item.id}
                                className={`rounded-md border px-2.5 py-1 text-[11px] transition ${
                                    periodId === item.id
                                        ? "border-[#b8f22d]/40 bg-[#b8f22d]/10 text-[#b8f22d]"
                                        : "border-white/10 text-slate-400 hover:text-slate-200"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-5 h-56 [&_*:focus]:outline-none">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={rows}
                                margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
                            >
                                <defs>
                                    <linearGradient id={`lowest-fill-${productId}`} x1="0" y1="0" x2="0" y2="1">
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
                                        type="linear"
                                        baseValue={priceTicks[0]}
                                        stroke="none"
                                        fill={`url(#lowest-fill-${productId})`}
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
                                            type="linear"
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
                                                        cx={cx}
                                                        cy={cy}
                                                        r={isLast ? 6 : 4}
                                                        fill={color}
                                                        stroke={SURFACE}
                                                        strokeWidth={2}
                                                    />
                                                );
                                            }}
                                            activeDot={{
                                                r: 6,
                                                fill: color,
                                                stroke: SURFACE,
                                                strokeWidth: 2,
                                            }}
                                        />
                                    );
                                })}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
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
                <p className="mt-2 text-[11px] text-slate-500">
                    Preços encontrados pelo Barganha.io
                </p>
            </div>
        </Card>
    );
}

export default PriceHistoryChart;
