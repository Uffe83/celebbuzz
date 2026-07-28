import Image from "next/image";
import { articles } from "../../data/articles";
type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

const article = articles.find((a) => a.slug === slug);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-4xl p-8">

        <p className="mb-4 uppercase text-pink-500">
  {article?.category}
</p>

        <h1 className="mb-6 text-5xl font-bold">
          {article?.title}
        </h1>

        <p className="mb-8 text-zinc-400">
  {article?.date}
</p>

        <div className="mb-10 overflow-hidden rounded-3xl">
  <Image
    src={article!.image}
    alt={article!.title}
    width={1200}
    height={700}
    className="h-96 w-full object-cover"
  />
</div>

        <article className="space-y-6 text-lg leading-8 text-zinc-300">
          <p>
            {article?.content}
          </p>

          <p>
            Senare kommer AI automatiskt att skriva texten och databasen kommer att hämta innehållet.
          </p>
        </article>

      </div>
    </main>
  );
}