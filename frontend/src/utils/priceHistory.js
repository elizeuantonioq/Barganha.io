// Lógica do histórico de preços: só funções e constantes, nada de JSX.
// Separar a lógica da parte visual deixa cada arquivo menor e mais fácil de testar.

export const MINUTE = 60 * 1000;
export const DAY = 24 * 60 * MINUTE;

// Cores do tema do gráfico
export const ACCENT = "#b8f22d";
export const SURFACE = "#0d1117";
export const GRID = "rgba(255, 255, 255, 0.07)";
export const MUTED = "#7d8590";
export const PRICE_UP = "#ec835a";

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

export function storeColor(store) {
  if (STORE_COLORS[store]) return STORE_COLORS[store];

  const hash = [...store].reduce((total, char) => total + char.charCodeAt(0), 0);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

export const PERIODS = [
  { id: "30d", label: "30 dias", days: 30 },
  { id: "90d", label: "90 dias", days: 90 },
  { id: "1y", label: "1 ano", days: 365 },
];

export const VERDICT_STYLES = {
  good: { icon: "✓", color: ACCENT },
  neutral: { icon: "•", color: "#94a3b8" },
  bad: { icon: "▲", color: PRICE_UP },
};

// Formatadores de preço e data
export const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const axisPriceFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

export const fullDateFormatter = new Intl.DateTimeFormat("pt-BR", {
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

function formatMonth(time) {
  const month = monthFormatter.format(time).replace(".", "");
  return month.charAt(0).toUpperCase() + month.slice(1);
}

// Os rótulos vão até o minuto: agrupar por minuto evita pontos repetidos
// (ex.: lojas registradas com milissegundos de diferença).
export const toMinute = (time) => Math.floor(time / MINUTE) * MINUTE;

/**
 * Uma linha por minuto com registro.
 * - `prices`: último preço conhecido de cada loja (o preço vale até mudar),
 *   usado no tooltip e nos resumos.
 * - `line`: só os preços registrados naquele minuto; cada loja liga apenas os
 *   próprios registros no gráfico.
 */
export function buildRows(stores) {
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

// Preços de uma linha, do mais barato para o mais caro.
export function pricesIn(row, stores) {
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

// Junta tudo o que o gráfico precisa para o período escolhido.
export function buildChart(allRows, stores, loadedAt, period) {
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
}

// Etiqueta "Menor" para o primeiro da lista e "Maior" para o último.
export function tagFor(index, total) {
  if (total < 2) return null;
  if (index === 0) return "lowest";
  if (index === total - 1) return "highest";
  return null;
}