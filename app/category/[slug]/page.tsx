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
  .ilike("category", slug);

return (
  <main className="mx-auto max-w-6xl px-6 py-12">
    <h1 className="mb-10 text-5xl font-black uppercase text-white">
      {slug}
    </h1>

{filteredArticles?.map((article) => (
      <Link
        key={article.slug}
        href={`/article/${article.slug}`}
        className="mb-8 block rounded-2xl bg-zinc-900 p-6 transition hover:bg-zinc-800"
      >
        <Image
          src={article.image}
          alt={article.title}
          width={1200}
          height={700}
          className="mb-4 h-72 w-full rounded-xl object-cover"
        />

        <p className="mb-2 text-sm uppercase tracking-wider text-pink-500">
          {article.category}
        </p>

        <h2 className="mb-3 text-3xl font-bold text-white">
          {article.title}
        </h2>

        <p className="text-zinc-400">
          {article.date}
        </p>
      </Link>
    ))}
  </main>
);
}