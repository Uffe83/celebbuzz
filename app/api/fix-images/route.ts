import { supabase } from "@/lib/supabase";

import { createClient } from "@supabase/supabase-js";

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
  console.log("🎨 Genererar AI-bild...");

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
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
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

if (!response.ok) {
  console.error(
    "❌ OpenRouter error:",
    response.status,
    JSON.stringify(result, null, 2)
  );

  throw new Error(
    `Bildgenerering misslyckades: ${response.status} ${JSON.stringify(result)}`
  );
}

  const base64Image = result.data?.[0]?.b64_json;

  if (!base64Image) {
    console.error("❌ Ingen bilddata hittades:", result);
    throw new Error("Ingen bilddata från bildgeneratorn");
  }

  const imageBuffer = Buffer.from(base64Image, "base64");

  const safeSlug = slug
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const filePath = `articles/${safeSlug}-${Date.now()}.png`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("article-images")
    .upload(filePath, imageBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from("article-images")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.FIX_IMAGES_SECRET) {
    return Response.json(
      { error: "Obehörig" },
      { status: 401 }
    );
  }
 
const { data: articles, error } = await supabase
  .from("articles")
  .select("id, title, slug")
  .or("image.is.null,image.eq./images/test.jpg")
  .limit(5);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }


if (!articles || articles.length === 0) {
  return Response.json({
    message: "Inga artiklar utan bild hittades",
  });
}

const results = [];

for (const article of articles) {
  try {
    const imagePrompt =
      `Create an editorial image inspired by this entertainment news story: ${article.title}`;

    const imageUrl = await generateImage(
      imagePrompt,
      article.slug
    );

    const { error: updateError } = await supabaseAdmin
      .from("articles")
      .update({ image: imageUrl })
      .eq("id", article.id);

    if (updateError) {
      throw updateError;
    }

    results.push({
      id: article.id,
      title: article.title,
      success: true,
      imageUrl,
    });

  } catch (error) {
    console.error(
      `❌ Misslyckades med artikel ${article.id}:`,
      error
    );

    results.push({
      id: article.id,
      title: article.title,
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Okänt fel",
    });
  }
}

return Response.json({
  message: "Batch klar",
  processed: results.length,
  results,
});
}