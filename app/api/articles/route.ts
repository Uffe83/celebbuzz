import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json(data);
}