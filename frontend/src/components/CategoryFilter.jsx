function CategoryFilter({ categories, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onSelect(item)}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${selected === item
            ? "bg-[#b8f22d] text-[#0a0d12]"
            : "border border-white/10 text-slate-400 hover:border-white/40 hover:text-white"
            }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;