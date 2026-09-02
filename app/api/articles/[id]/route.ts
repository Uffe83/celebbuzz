import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      title,
      excerpt,
      content,
      category,
      status,
    } = body;

    const updateData: {
      title?: string;
      excerpt?: string;
      content?: string;
      category?: string;
      status?: string;
    } = {};

    // Uppdatera bara fält som faktiskt skickats
    if (title !== undefined) {
      updateData.title = title;
    }

    if (excerpt !== undefined) {
      updateData.excerpt = excerpt;
    }

    if (content !== undefined) {
      updateData.content = content;
    }

    if (category !== undefined) {
      updateData.category = category;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const { data, error } = await supabase
      .from("articles")
      .update(updateData)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase update error:", error);

      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return Response.json(
        { error: `Artikeln med id ${id} hittades inte` },
        { status: 404 }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error("PATCH /api/articles/[id] error:", error);

    return Response.json(
      { error: "Kunde inte uppdatera artikeln" },
      { status: 500 }
    );
  }
}