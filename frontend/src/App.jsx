import { useMemo, useState } from "react";

const offers = [
  {
    id: 1,
    category: "Eletrônicos",
    product: "PlayStation 5 Slim Digital",
    model: "1TB · Console",
    bestStore: "Amazon",
    bestPrice: "R$ 3.149,00",
    previousPrice: "R$ 3.599,00",
    saving: "R$ 450,00",
    change: "-12,5%",
    stores: 4,
    signal: "BAIXANDO",
  },
  {
    id: 2,
    category: "Eletrônicos",
    product: "Monitor LG UltraGear 24”",
    model: "180Hz · Full HD",
    bestStore: "KaBuM!",
    bestPrice: "R$ 799,90",
    previousPrice: "R$ 1.099,90",
    saving: "R$ 300,00",
    change: "-27,3%",
    stores: 3,
    signal: "OFERTA FORTE",
  },
  {
    id: 3,
    category: "Dia a dia",
    product: "Air Fryer Mondial Family",
    model: "4L · AFN-40",
    bestStore: "Mercado Livre",
    bestPrice: "R$ 329,90",
    previousPrice: "R$ 429,90",
    saving: "R$ 100,00",
    change: "-23,3%",
    stores: 5,
    signal: "BAIXANDO",
  },
  {
    id: 4,
    category: "Dia a dia",
    product: "Cápsulas Nescafé Dolce Gusto",
    model: "Kit com 90 unidades",
    bestStore: "Magalu",
    bestPrice: "R$ 159,00",
    previousPrice: "R$ 199,90",
    saving: "R$ 40,90",
    change: "-20,4%",
    stores: 3,
    signal: "ALERTA",
  },
];

function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [favorites, setFavorites] = useState([]);

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesSearch = `${offer.product} ${offer.model} ${offer.bestStore}`
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesSearch && (category === "Todos" || offer.category === category);
    });
  }, [query, category]);

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
            Monitoramento ativo
          </span>
          <span>Última atualização: agora</span>
        </div>
      </div>

      <header className="border-b border-white/10 bg-[#0a0d12]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <a href="/" className="text-xl font-extrabold tracking-tight">
            BARGANHA<span className="text-[#b8f22d]">.IO</span>
          </a>

          <nav className="hidden gap-7 text-sm text-slate-400 md:flex">
            <a href="#monitor" className="transition hover:text-[#b8f22d]">Monitor</a>
            <a href="#ofertas" className="transition hover:text-[#b8f22d]">Ofertas</a>
            <a href="#alertas" className="transition hover:text-[#b8f22d]">Alertas</a>
          </nav>

          <button className="border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider transition hover:border-[#b8f22d] hover:text-[#b8f22d]">
            Entrar
          </button>
        </div>
      </header>

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
              O Barganha.io acompanha produtos em várias lojas e mostra onde
              está o menor preço antes de você comprar.
            </p>

            <div className="mt-9 flex max-w-2xl border border-white/15 bg-[#111722]">
              <span className="px-4 py-4 font-['DM_Mono'] text-sm text-[#b8f22d]">&gt;_</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="buscar produto, marca ou loja"
                className="min-w-0 flex-1 bg-transparent py-4 pr-3 text-sm text-white outline-none placeholder:text-slate-600"
              />
              <button className="bg-[#b8f22d] px-5 text-xs font-extrabold uppercase tracking-wider text-[#0a0d12] transition hover:bg-white">
                Escanear
              </button>
            </div>
          </div>

          <aside className="border border-white/10 bg-[#0d1117] p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <p className="font-['DM_Mono'] text-xs uppercase tracking-wider text-slate-500">
                sinal detectado
              </p>
              <span className="animate-pulse text-xs text-[#b8f22d]">● AO VIVO</span>
            </div>

            <div className="py-7">
              <p className="text-sm text-slate-400">Maior queda monitorada</p>
              <h2 className="mt-2 text-2xl font-bold">Monitor LG UltraGear 24”</h2>
              <p className="mt-1 font-['DM_Mono'] text-xs text-slate-500">KA-BU-M · 180HZ · FULL HD</p>

              <div className="mt-7 flex items-end justify-between">
                <div>
                  <p className="font-['DM_Mono'] text-xs text-slate-500 line-through">R$ 1.099,90</p>
                  <p className="mt-1 text-4xl font-extrabold text-[#b8f22d]">R$ 799,90</p>
                </div>
                <p className="border border-[#b8f22d]/40 px-3 py-2 font-['DM_Mono'] text-sm text-[#b8f22d]">
                  ↓ 27,3%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 border-t border-white/10 pt-4 text-center">
              <div>
                <p className="font-['DM_Mono'] text-xs text-slate-500">LOJAS</p>
                <p className="mt-1 font-bold">03</p>
              </div>
              <div className="border-x border-white/10">
                <p className="font-['DM_Mono'] text-xs text-slate-500">ECONOMIA</p>
                <p className="mt-1 font-bold">R$ 300</p>
              </div>
              <div>
                <p className="font-['DM_Mono'] text-xs text-slate-500">STATUS</p>
                <p className="mt-1 font-bold text-[#b8f22d]">ATIVO</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="ofertas" className="mx-auto max-w-7xl px-5 py-14">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-6 md:flex-row md:items-end">
          <div>
            <p className="font-['DM_Mono'] text-xs uppercase tracking-[0.18em] text-[#b8f22d]">
              // mapa de oportunidades
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
              Ofertas rastreadas
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Todos", "Eletrônicos", "Dia a dia"].map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  category === item
                    ? "bg-[#b8f22d] text-[#0a0d12]"
                    : "border border-white/10 text-slate-400 hover:border-white/40 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

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

            {filteredOffers.map((offer) => {
              const isFavorite = favorites.includes(offer.id);

              return (
                <article
                  key={offer.id}
                  className="grid grid-cols-[2.1fr_0.7fr_1fr_0.9fr_0.7fr_0.4fr] items-center gap-4 border-b border-white/10 px-5 py-5 transition last:border-b-0 hover:bg-white/[0.03]"
                >
                  <div>
                    <p className="font-bold">{offer.product}</p>
                    <p className="mt-1 font-['DM_Mono'] text-xs text-slate-500">{offer.model}</p>
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
                    onClick={() => toggleFavorite(offer.id)}
                    aria-label="Adicionar aos favoritos"
                    className={`text-xl transition ${
                      isFavorite ? "text-[#b8f22d]" : "text-slate-600 hover:text-white"
                    }`}
                  >
                    {isFavorite ? "★" : "☆"}
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        {filteredOffers.length === 0 && (
          <p className="border border-white/10 p-10 text-center font-['DM_Mono'] text-sm text-slate-500">
            NENHUM SINAL ENCONTRADO PARA ESTA BUSCA.
          </p>
        )}
      </section>
    </main>
  );
}

export default App;
