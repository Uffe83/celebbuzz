"use client";

import { useState } from "react";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function generateArticle() {
    setLoading(true);
    setMessage("");

    try {
  const response = await fetch("/api/admin/fetch-news");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Importen misslyckades");
      }

setMessage(
  `✅ RSS-import klar! | 🟢 Nya: ${data.processed} | ⏭️ Dubbletter: ${data.skipped} | ❌ Fel: ${data.failed} | 📊 Kvar idag: ${data.remaining ?? 0}`
);
    } catch (error) {
      console.error(error);

      setMessage("❌ Något gick fel vid RSS-importen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        padding: 40,
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      <h1>CelebBuzz Admin</h1>

      <button
        onClick={generateArticle}
        disabled={loading}
        style={{
          padding: "16px 28px",
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        {loading ? "Importerar nyheter..." : "📰 Hämta senaste nyheter"}
      </button>

      {message && (
        <div
          style={{
            marginTop: 30,
            padding: 20,
            background: "#d1fae5",
            borderRadius: 10,
            color: "#065f46",
            fontWeight: "bold",
          }}
        >
          {message}
        </div>
      )}
    </main>
  );
}