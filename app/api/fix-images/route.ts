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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.FIX_IMAGES_SECRET) {
    return Response.json(
      { error: "Obehörig" },
      { status: 401 }
    );
  }

  /*
   * Hämta artiklar som har en riktig källbild.
   *
   * Vi behandlar:
   * - artiklar där image är NULL
   * - artiklar där image fortfarande är en extern URL
   *
   * Vi hoppar över artiklar där image redan är en lokal
   * Supabase Storage-URL.
   */

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const localImagePrefix =
    `${supabaseUrl}/storage/v1/object/public/article-images/`;

  const { data: articles, error } = await supabase
    .from("articles")
    .select(
      "id, title, slug, source_image_url, image, image_generated"
    )
    .not("source_image_url", "is", null)
    .eq("image_generated", false)
    .or(
      `image.is.null,image.not.like.${localImagePrefix}%`
    )
    .order("id", { ascending: false })
    .limit(5);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  if (!articles || articles.length === 0) {
    return Response.json({
      message: "Inga artiklar med källbild behöver behandlas",
      processed: 0,
      results: [],
    });
  }

  const results = [];

  for (const article of articles) {
    try {
      if (!article.source_image_url) {
        throw new Error("source_image_url saknas");
      }

      console.log(
        `⬇️ Hämtar riktig källbild för artikel ${article.id}:`,
        article.source_image_url
      );

      /*
       * 1. Hämta den riktiga bilden från originalkällan.
       */

      const imageResponse = await fetch(
        article.source_image_url,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; EntertainmentNewsBot/1.0)",
          },
        }
      );

      if (!imageResponse.ok) {
        throw new Error(
          `Kunde inte hämta bilden: HTTP ${imageResponse.status}`
        );
      }

      const imageBuffer = Buffer.from(
        await imageResponse.arrayBuffer()
      );

      if (!imageBuffer.length) {
        throw new Error("Den hämtade bilden var tom");
      }

      /*
       * 2. Bestäm bildens filtyp.
       */

      const contentType =
        imageResponse.headers.get("content-type") ||
        "image/jpeg";

      let extension = "jpg";

      if (contentType.includes("png")) {
        extension = "png";
      } else if (contentType.includes("webp")) {
        extension = "webp";
      } else if (contentType.includes("gif")) {
        extension = "gif";
      } else if (
        contentType.includes("jpeg") ||
        contentType.includes("jpg")
      ) {
        extension = "jpg";
      }

      /*
       * 3. Skapa ett säkert filnamn.
       */

      const safeSlug = article.slug
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      const filePath =
        `articles/${safeSlug}-source.${extension}`;

      console.log(
        `⬆️ Laddar upp källbild till Supabase: ${filePath}`
      );

      /*
       * 4. Spara den riktiga bilden i Supabase Storage.
       */

      const { error: uploadError } =
        await supabaseAdmin.storage
          .from("article-images")
          .upload(
            filePath,
            imageBuffer,
            {
              contentType,
              upsert: true,
            }
          );

      if (uploadError) {
        throw uploadError;
      }

      /*
       * 5. Skapa publik Supabase-URL.
       */

      const { data: publicUrlData } =
        supabaseAdmin.storage
          .from("article-images")
          .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      /*
       * 6. Spara den lokala bilden på artikeln.
       *
       * image_generated förblir false eftersom bilden
       * INTE är AI-genererad.
       */

      const {
        data: updatedArticle,
        error: updateError,
      } = await supabaseAdmin
        .from("articles")
        .update({
          image: imageUrl,
          image_generated: false,
        })
        .eq("id", article.id)
        .select(
          "id, image, image_generated, source_image_url"
        )
        .single();

      if (updateError) {
        throw updateError;
      }

      console.log(
        "✅ Riktig källbild sparad:",
        updatedArticle
      );

      results.push({
        id: article.id,
        title: article.title,
        success: true,
        sourceImageUrl: article.source_image_url,
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