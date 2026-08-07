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
  article: Parser.Item
) {
  console.log("==================================");
  console.log("Genererar artikel:");
  console.log(article.title);
console.log("AI väljer kategori automatiskt");

  console.log("Skickar till OpenRouter...");

  const response = await openai.chat.completions.create({
    model: "openai/gpt-4.1-mini",
    messages: [
      {
        role: "user",
        content: `
Du är chefredaktör på Sveriges största digitala nöjessajt.

Ditt uppdrag är att skriva en professionell svensk nöjesartikel OCH fatta samma redaktionella beslut som en erfaren chefredaktör.

Du ska bedöma:

- hur viktig nyheten är
- hur stort allmänintresset är
- hur känt ämnet eller personen är
- hur aktuell nyheten är
- hur stor sannolikheten är att många klickar på artikeln

Skriv sedan artikeln.

Titel:
${article.title}

Sammanfattning:
${article.contentSnippet}

Svara ENDAST med giltig JSON.

Format:

{
  "title":"...",
  "slug":"...",
  "category":"...",
  "priority":95,
  "excerpt":"...",
  "readingTime":3,
  "image":"/images/test.jpg",
  "content":"...",
  "date":"31 juli 2026"
}
Kategori måste vara EN av dessa:

- Nöje
- Film
- TV & Streaming
- Musik
- Kungligt

Välj alltid den mest specifika kategorin.

Exempel:
- Filmpremiärer, skådespelare och regissörer → Film
- TV-serier och streamingtjänster → TV & Streaming
- Artister, konserter och album → Musik
- Kungahus → Kungligt

Använd endast "Nöje" om ingen annan kategori passar bättre.

Regler:

- title = lockande rubrik
- slug = små bokstäver och bindestreck
- image = alltid "/images/test.jpg"
- priority = ett heltal mellan 1 och 100.

Bedöm nyhetsvärdet som en erfaren chefredaktör.

Sätt inte en hög priority enbart för att personen är känd.

Bedöm istället den faktiska nyhetens betydelse, genomslag och sannolika intresse för läsarna.

En liten notis om en världskändis kan ha lägre prioritet än en mycket stor nyhet om en mindre känd person.

Tänk på:

- Hur känt ämnet eller personen är.
- Hur många människor som sannolikt kommer att vara intresserade.
- Om nyheten är internationellt uppmärksammad.
- Om nyheten är oväntad eller mycket aktuell.
- Om nyheten sannolikt kommer att delas mycket i sociala medier.
- Om nyheten skulle kunna vara huvudrubrik på en stor nöjessajt.

Använd denna skala:

100 = Exceptionellt stor global nöjesnyhet.
Exempel:
- Stora dödsfall
- Oscarsgalan
- Taylor Swift
- Brad Pitt
- Beyoncé
- Kungliga familjer
- Netflix största premiärer
- Globala skandaler

90–99 = Mycket stor internationell nöjesnyhet.

70–89 = Viktig nöjesnyhet.

40–69 = Normal nöjesnyhet.

1–39 = Smal nyhet med begränsat intresse.

Använd hela skalan.
Ge inte automatiskt höga poäng.
Bara ett fåtal artiklar ska få 95–100.

- excerpt = skriv en lockande ingress på 20–30 ord som sammanfattar artikeln


- readingTime = uppskattad lästid i minuter
- content = cirka 200–300 ord
- dela upp texten i 4–6 stycken
- separera varje stycke med \n\n
- skriv som en svensk nöjesjournalist
- börja med den viktigaste informationen
- använd ett naturligt språk
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

 console.log("=== AI JSON ===");
console.log(generatedArticle);
console.log("================"); 

  const rssArticle = article as any;

console.log("===== Bildfält =====");
console.log("enclosure:", rssArticle.enclosure);
console.log("media:content:", rssArticle["media:content"]);
console.log("media:thumbnail:", rssArticle["media:thumbnail"]);
console.log("image:", rssArticle.image);
console.log("itunes:", rssArticle.itunes);
console.log("====================");

  console.log(rssArticle);

  const image =
    rssArticle.enclosure?.url ||
    rssArticle["media:content"]?.url ||
    rssArticle["media:thumbnail"]?.url ||
    "/images/test.jpg";

  generatedArticle.image = image;
  generatedArticle.source_url = article.link;

  generatedArticle.reading_time = generatedArticle.readingTime;
delete generatedArticle.readingTime;

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
      console.log("Läser RSS:", feedInfo.name);

      const feed = await parser.parseURL(feedInfo.url);

const latestArticles = feed.items.slice(0, 10);

for (const article of latestArticles) {
  try {
  await generateArticle(article);
  } catch (error) {
    console.error("Kunde inte importera artikel:", article.title);
    console.error(error);
  }
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