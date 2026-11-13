function SearchForm({ query, onQueryChange, onSubmit, isLoading }) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-9 flex max-w-2xl border border-white/15 bg-[#111722]"
    >
      <span className="px-4 py-4 font-['DM_Mono'] text-sm text-[#b8f22d]">
        &gt;_
      </span>

      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="buscar produto, marca ou loja"
        className="min-w-0 flex-1 bg-transparent py-4 pr-3 text-sm text-white outline-none placeholder:text-slate-600"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="bg-[#b8f22d] px-5 text-xs font-extrabold uppercase tracking-wider text-[#0a0d12] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Buscando..." : "Buscar"}
      </button>
    </form>
  );
}

export default SearchForm;