import { supabase } from "@/lib/supabase";
import { feeds } from "@/lib/rss-feeds";
import Parser from "rss-parser";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const parser = new Parser({
  timeout: 10000,
});

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

async function generateImage(imagePrompt: string, slug: string) {
  console.log("🎨 Genererar artikelbild...");

const prompt =
  "Professional editorial entertainment image for a major Swedish entertainment news website. " +
  imagePrompt +
  " Cinematic lighting, premium magazine photography aesthetic, wide horizontal composition, " +
  "realistic details, no identifiable person, no text, no logos, no watermark.";

  const response = await fetch(
    "https://openrouter.ai/api/v1/images",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image",
        prompt,
        aspect_ratio: "16:9",
      }),
    }
  );

const result = await response.json();

console.log("🎨 Bild-API status:", response.status);

if (!response.ok) {
  console.error("❌ Bildgenerering misslyckades:", result);
  throw new Error("Bildgenerering misslyckades");
}

const base64Image = result.data?.[0]?.b64_json;

if (!base64Image) {
  console.error("❌ Ingen bilddata hittades:", result);
  throw new Error("Ingen bilddata från bildgeneratorn");
}

const imageBuffer = Buffer.from(base64Image, "base64");

console.log("🖼️ Bild mottagen!");
console.log("📦 Bildstorlek:", imageBuffer.length, "bytes");

const safeSlug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const filePath = `articles/${safeSlug}-${Date.now()}.png`;

const { error: uploadError } = await supabaseAdmin.storage
  .from("article-images")
  .upload(filePath, imageBuffer, {
    contentType: "image/png",
    upsert: true,
  });

if (uploadError) {
  console.error("❌ Kunde inte ladda upp bilden:", uploadError);
  throw uploadError;
}

const { data: publicUrlData } = supabaseAdmin.storage
  .from("article-images")
  .getPublicUrl(filePath);

console.log("✅ Bild sparad i Supabase!");
console.log("🖼️ Bild-URL:", publicUrlData.publicUrl);

return {
  success: true,
  imagePath: filePath,
  imageUrl: publicUrlData.publicUrl,
};
}

async function generateArticle(
  article: Parser.Item
) {

  const { data: existingArticle, error: existingArticleError } = await supabaseAdmin
    .from("articles")
    .select("id")
    .eq("source_url", article.link)
    .limit(1)
    .maybeSingle();

  if (existingArticleError) {
    throw existingArticleError;
  }

  if (existingArticle) {
    console.log("⏭️ Källan finns redan, hoppar över:", article.title);

    return {
      success: true,
      skipped: true,
    };
  }

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
  "imagePrompt":"...",
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
- imagePrompt = skriv en detaljerad bildbeskrivning för en professionell redaktionell huvudbild som passar artikeln.

Bildprompten ska:

- vara direkt kopplad till artikelns viktigaste nyhet
- tydligt spegla artikelns ämne, miljö, händelse eller känsla
- fungera som huvudbild på en professionell svensk nöjessajt
- kännas exklusiv, modern och journalistisk
- ha en tydlig visuell idé och inte kännas som en generisk stockbild
- bilden ska göra det möjligt att förstå artikelns huvudämne även utan att läsa rubriken
- välj konkreta visuella element från artikeln framför abstrakta eller generiska symboler
- anpassa bildidén efter artikeltypen: film, TV, musik, kungligt eller övrigt nöje
- om artikeln handlar om ett specifikt verk, evenemang eller projekt ska bilden visuellt knyta an till just detta
- prioritera en stark huvudscen framför många små detaljer
- använda cinematisk ljussättning och professionell komposition när det passar ämnet
- lämna tillräckligt med visuellt utrymme för att fungera som en bred webb-bild

Om artikeln handlar om en verklig person:

- skapa inte en fotorealistisk kopia eller porträttliknande avbildning av personen
- använd istället en relevant miljö, situation, rekvisita eller symbolik kopplad till personen och nyheten
- bilden ska inte ge intryck av att vara ett äkta pressfoto

Skapa inte:

- påhittade citat
- tidningsrubriker
- vattenstämplar
- logotyper
- text i bilden
- generiska människor som bara representerar "en kändis"

Bildprompten ska vara på engelska eftersom den ska skickas till bildgeneratorn.

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

console.log("🎨 Genererar artikelbild från AI:ns imagePrompt...");

console.log("=== AI JSON ===");
console.log(generatedArticle);
console.log("================");

// Extra skydd mot dubbletter från olika RSS-flöden.
// Kontrollen sker INNAN bildgenereringen så att vi inte
// skapar en bild till en artikel som ändå ska hoppas över.
const { data: duplicateByTitle, error: duplicateTitleError } =
  await supabaseAdmin
    .from("articles")
    .select("id, title")
    .eq("title", generatedArticle.title)
    .limit(1)
    .maybeSingle();

if (duplicateTitleError) {
  throw duplicateTitleError;
}

if (duplicateByTitle) {
  console.log(
    "⏭️ Samma titel finns redan, sparar inte:",
    generatedArticle.title
  );

  return {
    success: true,
    skipped: true,
  };
}

console.log("🎨 Skapar och sparar egen AI-bild...");

const generatedImage = await generateImage(
  generatedArticle.imagePrompt,
  generatedArticle.slug
);

// Använd alltid vår egen AI-genererade bild som huvudbild.
generatedArticle.image = generatedImage.imageUrl;
generatedArticle.image_generated = true;

// Ingen extern bildkälla används längre.
generatedArticle.source_image_url = null;

generatedArticle.source_url = article.link;
generatedArticle.status = "draft";

generatedArticle.reading_time = generatedArticle.readingTime;
delete generatedArticle.readingTime;

console.log("Sparar som UTKAST i Supabase...");

const { error: insertError } = await supabaseAdmin
  .from("articles")
  .insert([generatedArticle]);

if (insertError) {
  throw insertError;
}


  console.log("✅ Sparad!");

  return {
    success: true,
    article: generatedArticle,
  };
}



async function repairOldArticleImages(maxRepairs = 3) {
  console.log("🔧 Kontrollerar gamla artiklar som saknar AI-bild...");

  const { data: articlesToRepair, error: repairQueryError } =
    await supabaseAdmin
      .from("articles")
      .select("id, slug, imagePrompt, image, image_generated")
      .or(
        "image_generated.is.false,image_generated.is.null,image.is.null"
      )
      .not("imagePrompt", "is", null)
      .limit(maxRepairs);

  if (repairQueryError) {
    throw repairQueryError;
  }

  if (!articlesToRepair || articlesToRepair.length === 0) {
    console.log("✅ Inga gamla artiklar behöver bildreparation.");
    return 0;
  }

  let repaired = 0;

  for (const article of articlesToRepair) {
    try {
      if (!article.imagePrompt || !article.slug) {
        continue;
      }

      console.log("🎨 Reparera bild för artikel:", article.id);

      const generatedImage = await generateImage(
        article.imagePrompt,
        article.slug
      );

      const { error: updateError } = await supabaseAdmin
        .from("articles")
        .update({
          image: generatedImage.imageUrl,
          image_generated: true,
          source_image_url: null,
        })
        .eq("id", article.id);

      if (updateError) {
        throw updateError;
      }

      repaired++;

      console.log("✅ Gammal artikel fick ny AI-bild:", article.id);
    } catch (error) {
      console.error(
        "❌ Kunde inte reparera bild för artikel:",
        article.id
      );
      console.error(error);
    }
  }

  return repaired;
}


export async function GET(request: Request) {
const authHeader = request.headers.get("authorization");

const validSecrets = [
  process.env.CRON_SECRET,
  process.env.SUPABASE_CRON_SECRET,
].filter(Boolean);

if (
  !authHeader ||
  !validSecrets.includes(authHeader.replace("Bearer ", ""))
) {
  return new Response("Unauthorized", { status: 401 });
}

  try {
    console.log("Startar RSS-import...");


    let failed = 0;
    let processed = 0;
    let skipped = 0;
    const MAX_ARTICLES_PER_DAY = 5;

    // Reparera upp till tre äldre artiklar med gamla/trasiga bilder.
    // Detta räknas inte som nya artiklar mot dagens gräns.
    const repairedImages = await repairOldArticleImages(3);

    console.log("Reparerade gamla artikelbilder:", repairedImages);

const startOfToday = new Date();
startOfToday.setHours(0, 0, 0, 0);

const { count: todayCount, error: countError } = await supabaseAdmin
  .from("articles")
  .select("id", { count: "exact", head: true })
  .gte("created_at", startOfToday.toISOString());

if (countError) {
  throw countError;
}

let remaining = MAX_ARTICLES_PER_DAY - (todayCount || 0);

if (remaining <= 0) {
  return Response.json({
    success: true,
    message: "Dagens gräns på 5 nya artiklar är redan nådd.",
    processed: 0,
    skipped: 0,
    failed: 0,
    repairedImages,
    dailyLimit: MAX_ARTICLES_PER_DAY,
    remaining: 0,
  });
}

for (const feedInfo of feeds) {
  if (remaining <= 0) break;

  try {
    console.log("--------------------------------");
    console.log("Läser RSS:", feedInfo.name);

    const feed = await parser.parseURL(feedInfo.url);
    const latestArticles = feed.items.slice(0, 3);

    for (const article of latestArticles) {
      if (remaining <= 0) break;

      try {
        const result = await generateArticle(article);

        if (result?.skipped) {
          skipped++;
          continue;
        }

        if (result?.success) {
          processed++;
          remaining--;
        }
      } catch (error) {
        failed++;

        console.error(
          "Kunde inte importera artikel:",
          article.title
        );

        console.error(error);
      }
    }
  } catch (error) {
    failed++;

    console.error(
      "❌ Kunde inte läsa RSS:",
      feedInfo.name
    );

    console.error(error);
  }
}

console.log("Alla feeds klara.");

return Response.json({
  success: failed === 0,
  message: "RSS-import klar.",
  processed,
  skipped,
  failed,
  repairedImages,
  dailyLimit: MAX_ARTICLES_PER_DAY,
  remaining,
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