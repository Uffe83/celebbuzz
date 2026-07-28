export default function Header() {
  return (
    <header className="border-b border-zinc-800 bg-black">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-6">
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="text-white">Celeb</span>
          <span className="text-pink-500">Buzz</span>
        </h1>

        <nav className="hidden gap-8 md:flex text-sm font-semibold uppercase">
          <a href="#">Hollywood</a>
          <a href="#">Reality</a>
          <a href="#">Kungligt</a>
          <a href="#">Influencers</a>
        </nav>
      </div>
    </header>
  );
}