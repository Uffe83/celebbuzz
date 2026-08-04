import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        <Link href="/" className="group">
          <div className="leading-none">
            <h1 className="text-4xl font-black tracking-tight text-white transition group-hover:text-pink-400">
              CELEB
            </h1>

            <h2 className="-mt-2 text-4xl font-black tracking-tight text-pink-500">
              BUZZ
            </h2>
          </div>
        </Link>

        <nav className="hidden gap-8 text-sm font-semibold uppercase tracking-wide text-zinc-300 md:flex">
<Link href="/category/hollywood" className="hover:text-pink-400 transition">
  Hollywood
</Link>

<Link href="/category/musik" className="hover:text-pink-400 transition">
  Musik
</Link>

<Link href="/category/kungligt" className="hover:text-pink-400 transition">
  Kungligt
</Link>

<Link href="/category/reality" className="hover:text-pink-400 transition">
  Reality
</Link>

<Link href="/category/tv" className="hover:text-pink-400 transition">
  TV
</Link>
        </nav>

        <button className="rounded-full border border-zinc-700 px-4 py-2 text-sm transition hover:border-pink-500 hover:text-pink-400">
          🔍
        </button>
      </div>
    </header>
  );
}