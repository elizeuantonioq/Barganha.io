import { PERIODS } from "../../utils/priceHistory";

// Botões 30 dias / 90 dias / 1 ano
function PeriodSelector({ periodId, onChange }) {
  return (
    <div className="mt-5 flex gap-2" role="group" aria-label="Período">
      {PERIODS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
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
  );
}

export default PeriodSelector;