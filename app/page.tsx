import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
const { data: articles, error } = await supabase
  .from("articles")
  .select("*")
  .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    return <div>Kunde inte hämta artiklar.</div>;
  }

if (!articles || articles.length === 0) {
  return (
    <main className="p-10 text-white">
      Inga artiklar ännu.
    </main>
  );
}

const heroArticle = [...articles].sort(
  (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
)[0];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      <Header />

      <section className="bg-pink-600 py-2 text-center font-semibold">
        🔥 BREAKING NEWS
      </section>

<section className="mx-auto max-w-7xl p-8">
  <Link href={`/article/${heroArticle.slug}`}>
    <div className="rounded-3xl bg-zinc-900 p-16 transition hover:bg-zinc-800 cursor-pointer">

      <div className="grid gap-16 lg:grid-cols-2 lg:items-center">

        {/* Vänster kolumn */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full bg-pink-500 px-3 py-1 text-xs font-bold uppercase text-white">
              BREAKING
            </span>

            <span className="text-sm font-semibold uppercase tracking-widest text-pink-400">
              {heroArticle.category}
            </span>
          </div>

          <h2 className="mb-6 text-4xl lg:text-6xl xl:text-7xl font-extrabold leading-none">
            {heroArticle.title}
          </h2>

          <p className="mb-8 max-w-2xl text-xl leading-8 text-zinc-300">
            {heroArticle.excerpt}
          </p>

          <p className="text-sm text-zinc-500">
            📅 {heroArticle.date}
            {" • "}
            ⏱ {heroArticle.reading_time} min läsning
            {" • "}
            👤 CelebBuzz Redaktion
          </p>
        </div>

        {/* Höger kolumn */}
        <div className="relative overflow-hidden rounded-3xl">
<Image
  src={heroArticle.image}
  alt={heroArticle.title}
  width={1200}
  height={700}
  priority
  className="h-[600px] w-full rounded-3xl object-cover shadow-2xl"
/>

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>

      </div>

    </div>
  </Link>
</section>

      <section className="mx-auto max-w-7xl px-8 pb-8">
  <div className="rounded-2xl bg-zinc-900 p-6">
    <h3 className="mb-5 flex items-center gap-2 text-2xl font-bold">
      🔥 Trendar nu
    </h3>

<div className="grid gap-4 md:grid-cols-4">
  {[...articles]
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .slice(0, 4)
    .map((article, index) => (
      <Link
        key={article.slug}
        href={`/article/${article.slug}`}
          className="group"
        >
          <div className="flex gap-4">
            <span className="text-3xl font-black text-pink-500">
              {index + 1}
            </span>

            <div>
              <p className="mb-1 text-xs uppercase text-pink-400">
                {article.category}
              </p>

              <p className="font-semibold transition group-hover:text-pink-400">
                {article.title}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
</section>

<section className="mx-auto max-w-7xl px-8 pb-16">
  <div className="mb-8 flex items-end justify-between">
    <div>
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-pink-500">
        Senaste
      </p>

      <h3 className="flex items-center gap-2 text-3xl font-extrabold">
        📰 Senaste Nyheter
      </h3>
    </div>
  </div>

  <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
    {articles
      .filter((article) => article.slug !== heroArticle.slug)
      .map((article) => (
        <Link
          key={article.slug}
          href={`/article/${article.slug}`}
          className="group"
        >
          <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900 shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:border-pink-500/40 group-hover:bg-zinc-800 group-hover:shadow-2xl">

            <div className="relative overflow-hidden">
              <Image
                src={article.image || article.source_image_url}
                alt={article.title}
                width={800}
                height={500}
                className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70" />

              <span className="absolute bottom-4 left-4 rounded-full bg-pink-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                {article.category}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-6">

              <p className="mb-3 text-xs text-zinc-500">
                📅 {article.date}
                {" • "}
                ⏱ {article.reading_time} min
              </p>

              <h4 className="mb-3 line-clamp-3 text-xl font-bold leading-snug transition group-hover:text-pink-400">
                {article.title}
              </h4>

              <p className="line-clamp-3 text-sm leading-6 text-zinc-400">
                {article.excerpt}
              </p>

              <div className="mt-auto pt-6">
                <span className="font-semibold text-pink-400 transition group-hover:text-pink-300">
                  Läs mer →
                </span>
              </div>

            </div>
          </article>
        </Link>
      ))}
  </div>
</section>

      <footer className="border-t border-zinc-800 p-8 text-center text-zinc-500">
        © 2026 CelebBuzz · Alla rättigheter förbehållna.
      </footer>

    </main>
  );
}