import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const { data: articles } = await supabase
    .from("articles")
    .select("slug, created_at")
    .order("created_at", { ascending: false });

  const articleUrls =
    articles?.map((article) => ({
      url: `https://celebbuzz-six.vercel.app/article/${article.slug}`,
      lastModified: article.created_at,
    })) ?? [];

  return [
    {
      url: "https://celebbuzz-six.vercel.app",
      lastModified: new Date(),
    },
    ...articleUrls,
  ];
}