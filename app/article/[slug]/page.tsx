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
  .eq("category", article?.category)
  .neq("slug", slug)
  .order("created_at", { ascending: false })
  .limit(3);

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

<div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
  <span>📅 {article?.date}</span>
  <span>•</span>
  <span>👤 CelebBuzz Redaktion</span>
  <span>•</span>
  <span>⏱️ 3 min läsning</span>
</div>

        <div className="mb-10 overflow-hidden rounded-3xl">
  <Image
    src={article!.image}
    alt={article!.title}
    width={1200}
    height={700}
    className="w-full h-auto rounded-3xl"
  />
</div>

<div className="mb-10 space-y-8 text-xl leading-10 text-zinc-300">
  {article?.content
    ?.split("\n\n")
    .map((paragraph: string, index: number) => (
      <p key={index}>{paragraph}</p>
    ))}
</div>

  
<section className="mt-20">
  <h2 className="mb-8 text-3xl font-bold">
    Relaterade artiklar
  </h2>

<div className="grid gap-6 md:grid-cols-2">
  {relatedArticles?.map((item) => (
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