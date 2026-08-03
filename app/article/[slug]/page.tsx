import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

const { data: article } = await supabase
  .from("articles")
  .select("*")
  .eq("slug", slug)
  .single();

const { data: relatedArticles } = await supabase
  .from("articles")
  .select("*")
  .neq("slug", slug)
  .limit(2);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-4xl p-8">

        <Link
  href="/"
  className="mb-8 inline-flex items-center text-pink-400 transition hover:text-pink-300"
>
  ← Tillbaka till startsidan
</Link>

        <p className="mb-4 uppercase text-pink-500">
  {article?.category}
</p>

        <h1 className="mb-6 text-5xl font-bold">
          {article?.title}
        </h1>

        <p className="mb-8 text-zinc-400">
  {article?.date}
</p>

<p className="mb-8 text-sm text-zinc-500">
  Av CelebBuzz Redaktion
</p>

        <div className="mb-10 overflow-hidden rounded-3xl">
  <Image
    src={article!.image}
    alt={article!.title}
    width={1200}
    height={700}
    className="w-full h-auto rounded-3xl"
  />
</div>

<p className="mb-10 text-2xl font-light leading-10 text-zinc-200">
  {article?.content}
</p>

  <article className="mx-auto max-w-3xl space-y-8 text-xl leading-10 text-zinc-300">
  <p>
    Hollywoodstjärnan fortsätter att vara en av branschens mest eftertraktade skådespelare.
    Den nya produktionen väntas bli en av årets största filmsatsningar och inspelningen
    påbörjas senare under året.
  </p>

  <p>
    Senare kommer AI automatiskt att skriva texten och databasen kommer att hämta innehållet.
  </p>
</article>
<section className="mt-20">
  <h2 className="mb-8 text-3xl font-bold">
    Relaterade artiklar
  </h2>

  <div className="grid gap-6 md:grid-cols-2">
    {relatedArticles.map((item) => (
      <Link key={item.slug} href={`/article/${item.slug}`}>
        <article className="overflow-hidden rounded-2xl bg-zinc-900 transition hover:bg-zinc-800">
          <Image
            src={item.image}
            alt={item.title}
            width={500}
            height={300}
            className="h-48 w-full object-cover"
          />

          <div className="p-5">
            <p className="mb-2 text-sm uppercase text-pink-400">
              {item.category}
            </p>

            <h3 className="text-xl font-semibold">
              {item.title}
            </h3>
          </div>
        </article>
      </Link>
    ))}
  </div>
</section>
      </div>
    </main>
  );
}