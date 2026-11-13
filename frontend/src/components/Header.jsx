function Header() {
  return (
    <header className="border-b border-white/10 bg-[#0a0d12]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <a href="/" className="text-xl font-extrabold tracking-tight">
          BARGANHA<span className="text-[#b8f22d]">.IO</span>
        </a>

        <nav className="hidden gap-7 text-sm text-slate-400 md:flex">
          <a href="#monitor" className="transition hover:text-[#b8f22d]">Monitor</a>
          <a href="#ofertas" className="transition hover:text-[#b8f22d]">Ofertas</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;