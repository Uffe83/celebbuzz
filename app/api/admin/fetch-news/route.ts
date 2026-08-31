import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const secret =
    process.env.CRON_SECRET ||
    process.env.SUPABASE_CRON_SECRET;

  if (!secret) {
    return Response.json(
      { error: "CRON_SECRET saknas" },
      { status: 500 }
    );
  }

  const url = new URL("/api/fetch-news", request.url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${secret}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  return Response.json(data, {
    status: response.status,
  });
}