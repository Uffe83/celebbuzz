import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import { supabase } from "../lib/supabase";

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

const heroArticle = articles[0];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      <Header />

      <section className="bg-pink-600 py-2 text-center font-semibold">
        🔥 BREAKING NEWS
      </section>

<section className="mx-auto max-w-6xl p-8">
  <Link href={`/article/${heroArticle.slug}`}>
    <div className="rounded-3xl bg-zinc-900 p-12 transition hover:bg-zinc-800 cursor-pointer">
<div className="mb-4 flex items-center gap-3">
  <span className="rounded-full bg-pink-500 px-3 py-1 text-xs font-bold uppercase text-white">
    BREAKING
  </span>

  <span className="text-sm font-semibold uppercase tracking-widest text-pink-400">
    {heroArticle.category}
  </span>
</div>

          <h2 className="mb-4 text-6xl font-extrabold">
  {heroArticle.title}
</h2>

<p className="max-w-2xl text-zinc-400">
  {heroArticle.content?.slice(0, 180)}...
</p>

<p className="mt-6 text-sm text-zinc-500">
  📅 {heroArticle.date} • 👤 CelebBuzz Redaktion
</p>
        <div className="mt-8 overflow-hidden rounded-3xl">
  <Image
    src={heroArticle.image}
    alt={heroArticle.title}
    width={1200}
    height={700}
    className="w-full h-auto rounded-3xl"
  />
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
      {articles.slice(0, 4).map((article, index) => (
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

      <section className="mx-auto max-w-7xl p-8">
<h3 className="mb-6 flex items-center gap-2 text-3xl font-bold">
  📰 Senaste Nyheter
</h3>

        <div className="grid gap-6 md:grid-cols-3">
{articles.slice(1).map((article) => (
  <Link
    key={article.slug}
href={`/article/${article.slug}`}
  >
    <article className="overflow-hidden rounded-2xl bg-zinc-900 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-zinc-800 p-6">
            
              <Image
  src={article.image}
  alt={article.title}
  width={500}
  height={300}
  className="h-52 w-full object-cover transition duration-300 hover:scale-105"
/>

<p className="mb-2 text-sm uppercase text-pink-400">
  {article.category}
</p>

<p className="mb-3 text-xs text-zinc-500">
  {article.date}
</p>

<h4 className="mb-2 text-xl font-semibold">
  {article.title}
</h4>

<p className="text-zinc-400">
{article.content?.slice(0, 100)}...
</p>

<p className="mt-5 font-semibold text-pink-400">
  Läs mer →
</p>

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