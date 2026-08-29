import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  let articles = [];

  if (query) {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (!error) {
      articles = data ?? [];
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Header />

      <section className="mx-auto max-w-7xl px-8 py-12">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-pink-500">
          SÖK
        </p>

        <h1 className="mb-8 text-4xl font-extrabold md:text-5xl">
          {query ? `Sökresultat för "${query}"` : "Sök på CelebBuzz"}
        </h1>

        <form className="mb-12 flex max-w-3xl gap-3">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Sök efter en artikel..."
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-white outline-none transition focus:border-pink-500"
          />

          <button
            type="submit"
            className="rounded-xl bg-pink-500 px-7 py-4 font-bold transition hover:bg-pink-400"
          >
            Sök
          </button>
        </form>

        {!query ? (
          <div className="rounded-2xl bg-zinc-900 p-10 text-zinc-400">
            Skriv något ovan för att söka bland artiklarna.
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-2xl bg-zinc-900 p-10">
            <h2 className="mb-2 text-2xl font-bold">
              Inga träffar
            </h2>
            <p className="text-zinc-400">
              Vi hittade inga artiklar som matchar din sökning.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-zinc-400">
              {articles.length} träffar
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/article/${article.slug}`}
                  className="group"
                >
                  <article className="overflow-hidden rounded-2xl bg-zinc-900 transition duration-300 hover:-translate-y-1 hover:bg-zinc-800">
                    <Image
                      src={article.image}
                      alt={article.title}
                      width={500}
                      height={300}
                      className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    <div className="p-6">
                      <p className="mb-2 text-sm font-semibold uppercase text-pink-400">
                        {article.category}
                      </p>

                      <h2 className="mb-3 text-xl font-bold">
                        {article.title}
                      </h2>

                      <p className="text-zinc-400">
                        {article.excerpt}
                      </p>

                      <p className="mt-5 font-semibold text-pink-400">
                        Läs mer →
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}