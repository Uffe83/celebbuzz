import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import { articles } from "./data/articles";

export default function Home() {
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
          <p className="mb-2 uppercase text-pink-400">
            {heroArticle.category}
          </p>

          <h2 className="mb-4 text-6xl font-extrabold">
  {heroArticle.title}
</h2>

          <p className="max-w-2xl text-zinc-400">
  {heroArticle.content}
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

      <section className="mx-auto max-w-7xl p-8">
        <h3 className="mb-6 text-3xl font-bold">
          Senaste Nyheter
        </h3>

        <div className="grid gap-6 md:grid-cols-3">
{articles.slice(1).map((article) => (
  <Link
    key={article.slug}
href={`/article/${article.slug}`}
  >
    <article className="rounded-2xl bg-zinc-900 p-6 transition hover:scale-105 hover:bg-zinc-800 cursor-pointer">
            
              <Image
  src={article.image}
  alt={article.title}
  width={500}
  height={300}
  className="mb-4 h-40 w-full rounded-xl object-cover"
/>

<p className="mb-2 text-sm uppercase text-pink-400">
  {article.category}
</p>

<h4 className="mb-2 text-xl font-semibold">
  {article.title}
</h4>

<p className="text-zinc-400">
  {article.content}
</p>

</article>
</Link>
))}
</div>
</section>

      <footer className="border-t border-zinc-800 p-8 text-center text-zinc-500">
        © 2026 CelebBuzz
      </footer>

    </main>
  );
}