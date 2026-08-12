import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: filteredArticles } = await supabase
    .from("articles")
    .select("*")
    .ilike("category", slug)
    .order("created_at", { ascending: false });

  if (!filteredArticles || filteredArticles.length === 0) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-8 text-5xl font-black uppercase">
            {slug}
          </h1>

          <p className="text-zinc-400">
            Inga artiklar hittades i denna kategori ännu.
          </p>
        </div>
      </main>
    );
  }

  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-8 py-12">

        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-pink-500">
          CelebBuzz
        </p>

        <h1 className="mb-10 text-5xl font-black uppercase md:text-6xl">
          {slug}
        </h1>

        {/* Huvudartikel */}
        <Link
          href={`/article/${featuredArticle.slug}`}
          className="group mb-12 block overflow-hidden rounded-3xl bg-zinc-900 transition hover:bg-zinc-800"
        >
          <div className="grid lg:grid-cols-2">

            <div className="relative min-h-[350px]">
              <Image
                src={featuredArticle.image}
                alt={featuredArticle.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col justify-center p-8 md:p-12">
              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-pink-400">
                {featuredArticle.category}
              </p>

              <h2 className="mb-6 text-4xl font-black leading-tight md:text-5xl">
                {featuredArticle.title}
              </h2>

              <p className="mb-8 text-lg leading-8 text-zinc-400">
                {featuredArticle.excerpt}
              </p>

              <p className="text-sm text-zinc-500">
                📅 {featuredArticle.date}
                {" • "}
                ⏱ {featuredArticle.reading_time} min läsning
              </p>
            </div>

          </div>
        </Link>

        {/* Övriga artiklar */}
        {remainingArticles.length > 0 && (
          <>
            <h2 className="mb-6 text-3xl font-black">
              Senaste i {slug}
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {remainingArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/article/${article.slug}`}
                  className="group"
                >
                  <article className="h-full overflow-hidden rounded-2xl bg-zinc-900 transition duration-300 hover:-translate-y-2 hover:bg-zinc-800">

                    <div className="relative h-52 overflow-hidden">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-6">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-pink-400">
                        {article.category}
                      </p>

                      <h3 className="mb-3 text-xl font-bold leading-snug">
                        {article.title}
                      </h3>

                      <p className="mb-4 text-sm text-zinc-400">
                        {article.excerpt}
                      </p>

                      <p className="text-xs text-zinc-500">
                        📅 {article.date}
                        {" • "}
                        ⏱ {article.reading_time} min
                      </p>
                    </div>

                  </article>
                </Link>
              ))}
            </div>
          </>
        )}

      </div>
    </main>
  );
}