"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

        {/* LOGO */}
        <Link href="/" className="group shrink-0">
          <div className="leading-none">
            <h1 className="text-4xl font-black tracking-tight text-white transition group-hover:text-pink-400">
              CELEB
            </h1>

            <h2 className="-mt-2 text-4xl font-black tracking-tight text-pink-500">
              BUZZ
            </h2>
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden gap-8 text-sm font-semibold uppercase tracking-wide text-zinc-300 md:flex">
          <Link
            href="/category/kandisar"
            className="transition hover:text-pink-400"
          >
            Kändisar
          </Link>

          <Link
            href="/category/film"
            className="transition hover:text-pink-400"
          >
            Film
          </Link>

          <Link
            href="/category/tv-streaming"
            className="transition hover:text-pink-400"
          >
            TV & Streaming
          </Link>

          <Link
            href="/category/musik"
            className="transition hover:text-pink-400"
          >
            Musik
          </Link>

          <Link
            href="/category/kungligt"
            className="transition hover:text-pink-400"
          >
            Kungligt
          </Link>

          <Link
            href="/category/reality"
            className="transition hover:text-pink-400"
          >
            Reality
          </Link>
        </nav>

        {/* SEARCH */}
        <div className="flex items-center gap-3">
          {searchOpen && (
            <form
              action="/search"
              method="GET"
              className="hidden md:block"
            >
              <input
                type="search"
                name="q"
                placeholder="Sök på CelebBuzz..."
                autoFocus
                className="w-56 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-pink-500"
              />
            </form>
          )}

          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Sök"
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm transition hover:border-pink-500 hover:text-pink-400"
          >
            🔍
          </button>
        </div>

      </div>

      {/* MOBIL SÖKNING */}
      {searchOpen && (
        <div className="border-t border-zinc-800 px-6 py-4 md:hidden">
          <form action="/search" method="GET">
            <input
              type="search"
              name="q"
              placeholder="Sök på CelebBuzz..."
              autoFocus
              className="w-full rounded-full border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-pink-500"
            />
          </form>
        </div>
      )}
    </header>
  );
}