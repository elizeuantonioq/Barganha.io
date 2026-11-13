import { useEffect, useMemo, useState } from "react";
import { searchOffers } from "./services/offers";
import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import FeaturedOffer from "./components/FeaturedOffer";
import CategoryFilter from "./components/CategoryFilter";
import OfferRow from "./components/OfferRow";

function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("barganha:favorites")) ?? [];
    } catch {
      return [];
    }
  });
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedProductId, setExpandedProductId] = useState(null);
  useEffect(() => {
    localStorage.setItem("barganha:favorites", JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    let active = true;
    searchOffers("")
      .then((results) => {
        if (active) setOffers(results);
      })
      .catch(() => {
        if (active) setError("Não foi possível conectar ao servidor Django.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);


  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const storeNames = offer.storeOffers
        .map((storeOffer) => storeOffer.store)
        .join(" ");

      const matchesSearch = `${offer.product} ${offer.model} ${offer.category} ${storeNames}`
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesSearch && (category === "Todos" || offer.category === category);
    });
  }, [offers, query, category]);

  const featuredOffer = useMemo(() => {
    if (offers.length === 0) return null;

    return offers.reduce((best, offer) =>
      offer.discountPercentage > best.discountPercentage ? offer : best,
    );
  }, [offers]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(offers.map((offer) => offer.category));
    return ["Todos", ...uniqueCategories];
  }, [offers]);

  async function handleSearch(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const results = await searchOffers(query);
      setOffers(results);
      setExpandedProductId(null);
      setCategory("Todos");
    } catch {
      setError("Não foi possível conectar ao servidor Django.");
    } finally {
      setIsLoading(false);
    }
  }

  function toggleComparison(id) {
    setExpandedProductId((currentId) =>
      currentId === id ? null : id,
    );
  }

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id],
    );
  }


  return (
    <main className="min-h-screen bg-[#0a0d12] text-[#e9edf2]">
      <div className="border-b border-white/10 bg-[#0d1117]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Protótipo demonstrativo
          </span>
          <span>Preços fictícios para demonstração</span>
        </div>
      </div>

      <Header />

      <section id="monitor" className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <p className="font-['DM_Mono'] text-xs uppercase tracking-[0.2em] text-[#b8f22d]">
              // Monitor de preços
            </p>

            <h1 className="mt-5 max-w-3xl text-5xl font-extrabold leading-[0.95] tracking-[-0.05em] md:text-7xl">
              PARE DE PAGAR
              <br />
              <span className="text-[#b8f22d]">O PREÇO CHEIO.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">
              Compare ofertas de diferentes lojas e encontre o menor preço.
              Esta versão usa dados demonstrativos para mostrar como a comparação funciona.
            </p>

            <SearchForm
              query={query}
              onQueryChange={setQuery}
              onSubmit={handleSearch}
              isLoading={isLoading}
            />

            {error && (
              <p className="mt-3 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>
          {featuredOffer && <FeaturedOffer offer={featuredOffer} />}
        </div>
      </section>

      <section id="ofertas" className="mx-auto max-w-7xl px-5 py-14">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-['DM_Mono'] text-xs uppercase tracking-[0.18em] text-[#b8f22d]">
              // mapa de oportunidades
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
              Ofertas de exemplo
            </h2>
          </div>
          <CategoryFilter
            categories={categories}
            selected={category}
            onSelect={setCategory}
          />
        </div>

        {isLoading && <p className="mt-5 text-sm text-slate-400">Carregando ofertas...</p>}
        <div className="mt-5 overflow-x-auto border border-white/10">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[2.1fr_0.7fr_1fr_0.9fr_0.7fr_0.4fr] gap-4 border-b border-white/10 bg-[#111722] px-5 py-4 font-['DM_Mono'] text-[11px] uppercase tracking-wider text-slate-500">
              <span>Produto</span>
              <span>Melhor loja</span>
              <span>Menor preço</span>
              <span>Economia</span>
              <span>Status</span>
              <span />
            </div>

            {filteredOffers.map((offer) => (
              <OfferRow
                key={offer.id}
                offer={offer}
                isFavorite={favorites.includes(offer.id)}
                isExpanded={expandedProductId === offer.id}
                onToggleFavorite={toggleFavorite}
                onToggleComparison={toggleComparison}
              />
            ))}

          </div>
        </div>

        {!isLoading && !error && filteredOffers.length === 0 && (
          <p className="border border-white/10 p-10 text-center font-['DM_Mono'] text-sm text-slate-500">
            NENHUM SINAL ENCONTRADO PARA ESTA BUSCA.
          </p>
        )}
      </section>
    </main>
  );
}

export default App;
