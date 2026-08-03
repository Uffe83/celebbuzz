import { supabase } from "@/lib/supabase";
import { feeds } from "@/lib/rss-feeds";
import Parser from "rss-parser";
import OpenAI from "openai";

const parser = new Parser({
  timeout: 10000,
});

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function generateArticle(
  article: Parser.Item,
  category: string
) {
  console.log("==================================");
  console.log("Genererar artikel:");
  console.log(article.title);
  console.log("Kategori:", category);

  console.log("Skickar till OpenRouter...");

  const response = await openai.chat.completions.create({
    model: "openai/gpt-4.1-mini",
    messages: [
      {
        role: "user",
        content: `
Du är journalist på Sveriges största nöjessajt.

Skriv om denna nyhet till en svensk nöjesartikel.

Titel:
${article.title}

Sammanfattning:
${article.contentSnippet}

Svara ENDAST med giltig JSON.

Format:

{
  "title":"...",
  "slug":"...",
  "category":"${category}",
  "image":"/images/test.jpg",
  "content":"...",
  "date":"31 juli 2026"
}

Regler:

- title = lockande rubrik
- slug = små bokstäver och bindestreck
- category = ${category}
- image = alltid "/images/test.jpg"
- content = cirka 150 ord
- inget annat än JSON
- använd INTE markdown
- börja direkt med {
`,
      },
    ],
  });

  console.log("✅ Svar från OpenRouter mottaget");

  const text = response.choices[0].message.content!;

  console.log("========= AI SVAR =========");
  console.log(text);
  console.log("===========================");

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const generatedArticle = JSON.parse(cleaned);

  const rssArticle = article as any;

  const image =
    rssArticle.enclosure?.url ||
    rssArticle["media:content"]?.url ||
    rssArticle["media:thumbnail"]?.url ||
    "/images/test.jpg";

  generatedArticle.image = image;
  generatedArticle.category = category;
  generatedArticle.source_url = article.link;

  const { data: existingArticle } = await supabase
    .from("articles")
    .select("id")
    .eq("source_url", article.link)
    .maybeSingle();

  if (existingArticle) {
    console.log("Artikeln finns redan.");

    return {
      success: true,
      message: "Artikeln finns redan.",
    };
  }

  console.log("Sparar i Supabase...");

  const { error } = await supabase
    .from("articles")
    .insert([generatedArticle]);

  if (error) {
    throw error;
  }

  console.log("✅ Sparad!");

  return {
    success: true,
    article: generatedArticle,
  };
}

export async function GET() {
  try {
    console.log("Startar RSS-import...");

    for (const feedInfo of feeds) {
      console.log("--------------------------------");
      console.log("Läser RSS:", feedInfo.url);

      const feed = await parser.parseURL(feedInfo.url);

      const latestArticle = feed.items[0];

      if (latestArticle) {
        await generateArticle(latestArticle, feedInfo.category);
      }
    }

    console.log("Alla feeds klara.");

    return Response.json({
      success: true,
      message: "Alla RSS-flöden har behandlats.",
    });
  } catch (error) {
    console.error("FEL:");
    console.error(error);

    return Response.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
}