function OfferRow({ offer, isFavorite, isExpanded, onToggleFavorite, onToggleComparison }) {
  return (
    <article
      className="grid grid-cols-[2.1fr_0.7fr_1fr_0.9fr_0.7fr_0.4fr] items-center gap-4 border-b border-white/10 px-5 py-5 transition last:border-b-0 hover:bg-white/[0.03]"
    >
      <div>
        <p className="font-bold">{offer.product}</p>
        <p className="mt-1 font-['DM_Mono'] text-xs text-slate-500">{offer.model}</p>
        {offer.storeOffers?.length > 1 && (
          <button
            type="button"
            onClick={() => onToggleComparison(offer.id)}
            aria-expanded={isExpanded}
            className="mt-3 text-xs font-bold uppercase tracking-wider text-[#b8f22d] transition hover:text-white"
          >
            {isExpanded
              ? "Fechar comparação"
              : `Comparar ${offer.stores} lojas`}
          </button>
        )}
 
      </div>
      <p className="text-sm text-slate-300">{offer.bestStore}</p>
      <div>
        <p className="font-bold text-[#b8f22d]">{offer.bestPrice}</p>
        <p className="mt-1 font-['DM_Mono'] text-xs text-slate-600 line-through">{offer.previousPrice}</p>
      </div>
      <div>
        <p className="text-sm font-bold">{offer.saving}</p>
        <p className="mt-1 font-['DM_Mono'] text-xs text-[#b8f22d]">{offer.change}</p>
      </div>
      <span className="w-fit border border-[#b8f22d]/30 px-2 py-1 font-['DM_Mono'] text-[10px] text-[#b8f22d]">
        {offer.signal}
      </span>
      <button
        onClick={() => onToggleFavorite(offer.id)}
        aria-label="Adicionar aos favoritos"
        className={`text-xl transition ${isFavorite ? "text-[#b8f22d]" : "text-slate-600 hover:text-white"
          }`}
      >
        {isFavorite ? "★" : "☆"}
      </button>
 
      {isExpanded && (
        <div className="col-span-6 border-t border-white/10 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-['DM_Mono'] text-xs uppercase text-[#b8f22d]">
              Comparação em {offer.stores} lojas
            </p>
            <p className="text-xs text-slate-500">
              Do menor para o maior preço
            </p>
          </div>
          <div className="grid gap-2">
            {offer.storeOffers.map((storeOffer) => (
              <div
                key={storeOffer.store}
                className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] items-center gap-4 border border-white/10 bg-[#0d1117] px-4 py-3"
              >
                <p className="text-sm font-bold">{storeOffer.store}</p>
                <p className="text-sm text-[#b8f22d]">{storeOffer.price}</p>
                <p className="text-xs text-slate-600 line-through">
                  {storeOffer.previousPrice}
                </p>
                <span className="text-right font-['DM_Mono'] text-[10px] text-slate-400">
                  {storeOffer.isBest
                    ? "MENOR PREÇO"
                    : `+ ${storeOffer.difference}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
 
export default OfferRow;
 