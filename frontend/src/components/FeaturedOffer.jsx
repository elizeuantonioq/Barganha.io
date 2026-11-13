function FeaturedOffer({ offer }) {
  return (
    <aside className="border border-white/10 bg-[#0d1117] p-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <p className="font-['DM_Mono'] text-xs uppercase tracking-wider text-slate-500">
          oferta em destaque
        </p>
        <span className="text-xs text-[#b8f22d]">DEMONSTRAÇÃO</span>
      </div>

      <div className="py-7">
        <p className="text-sm text-slate-400">Maior desconto agora</p>
        <h2 className="mt-2 text-2xl font-bold">{offer.product}</h2>
        <p className="mt-1 font-['DM_Mono'] text-xs uppercase text-slate-500">
          {offer.bestStore} · {offer.model}
        </p>

        <div className="mt-7 flex items-end justify-between">
          <div>
            <p className="font-['DM_Mono'] text-xs text-slate-500 line-through">
              {offer.previousPrice}
            </p>
            <p className="mt-1 text-4xl font-extrabold text-[#b8f22d]">
              {offer.bestPrice}
            </p>
          </div>
          <p className="border border-[#b8f22d]/40 px-3 py-2 font-['DM_Mono'] text-sm text-[#b8f22d]">
            ↓ {offer.discountPercentage.toFixed(1).replace(".", ",")}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-white/10 pt-4 text-center">
        <div>
          <p className="font-['DM_Mono'] text-xs text-slate-500">LOJAS</p>
          <p className="mt-1 font-bold">{String(offer.stores).padStart(2, "0")}</p>
        </div>
        <div className="border-x border-white/10">
          <p className="font-['DM_Mono'] text-xs text-slate-500">ECONOMIA</p>
          <p className="mt-1 font-bold">{offer.saving}</p>
        </div>
        <div>
          <p className="font-['DM_Mono'] text-xs text-slate-500">STATUS</p>
          <p className="mt-1 font-bold text-[#b8f22d]">EXEMPLO</p>
        </div>
      </div>
    </aside>
  );
}

export default FeaturedOffer;