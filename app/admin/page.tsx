"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");

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

      await loadArticles();
    } catch (error) {
      console.error(error);
      setMessage("❌ Något gick fel vid RSS-importen.");
    } finally {
      setLoading(false);
    }
  }

async function loadArticles() {
  const response = await fetch("/api/articles", {
    cache: "no-store",
  });

  const data = await response.json();

  if (response.ok) {
    setArticles(data);
  }
}

  function startEditing(article: any) {
    setEditingId(article.id);
    setEditTitle(article.title || "");
    setEditExcerpt(article.excerpt || "");
    setEditContent(article.content || "");
    setEditCategory(article.category || "");
    setMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle("");
    setEditExcerpt("");
    setEditContent("");
    setEditCategory("");
  }

  async function saveArticle(id: number) {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          excerpt: editExcerpt,
          content: editContent,
          category: editCategory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte spara artikeln");
      }

      setMessage("✅ Artikeln är sparad!");

      setEditingId(null);
      setEditTitle("");
      setEditExcerpt("");
      setEditContent("");
      setEditCategory("");

      await loadArticles();
    } catch (error) {
      console.error(error);
      setMessage("❌ Kunde inte spara artikeln.");
    } finally {
      setLoading(false);
    }
  }

  async function publishArticle(id: number) {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "published",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte publicera artikeln");
      }

      setMessage("🟢 Artikeln är publicerad!");

      await loadArticles();
    } catch (error) {
      console.error(error);
      setMessage("❌ Kunde inte publicera artikeln.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <main
      style={{
        padding: 40,
        maxWidth: 900,
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

      <section style={{ marginTop: 40 }}>
        <h2>📝 Utkast</h2>

        {articles.length === 0 ? (
          <p>Inga utkast ännu.</p>
        ) : (
          articles.map((article) => (
            <article
              key={article.id}
              style={{
                marginTop: 20,
                padding: 20,
                border: "1px solid #ddd",
                borderRadius: 10,
              }}
            >
              {editingId === article.id ? (
                <>
                  <h3>✏️ Redigerar artikel</h3>

                  <label>
                    <strong>Rubrik</strong>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: 10,
                        marginTop: 5,
                        marginBottom: 15,
                        boxSizing: "border-box",
                      }}
                    />
                  </label>

                  <label>
                    <strong>Ingress</strong>
                    <textarea
                      value={editExcerpt}
                      onChange={(e) => setEditExcerpt(e.target.value)}
                      rows={4}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: 10,
                        marginTop: 5,
                        marginBottom: 15,
                        boxSizing: "border-box",
                      }}
                    />
                  </label>

                  <label>
                    <strong>Innehåll</strong>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={12}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: 10,
                        marginTop: 5,
                        marginBottom: 15,
                        boxSizing: "border-box",
                      }}
                    />
                  </label>

                  <label>
                    <strong>Kategori</strong>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: 10,
                        marginTop: 5,
                        marginBottom: 20,
                        boxSizing: "border-box",
                      }}
                    />
                  </label>

                  <button
                    onClick={() => saveArticle(article.id)}
                    disabled={loading}
                    style={{
                      padding: "12px 20px",
                      marginRight: 10,
                      cursor: "pointer",
                    }}
                  >
                    {loading ? "Sparar..." : "💾 Spara"}
                  </button>

                  <button
                    onClick={cancelEditing}
                    disabled={loading}
                    style={{
                      padding: "12px 20px",
                      cursor: "pointer",
                    }}
                  >
                    Avbryt
                  </button>
                </>
              ) : (
                <>
                  <h3>{article.title}</h3>

                  <p>{article.excerpt}</p>

                  <p>
                    <strong>Kategori:</strong> {article.category}
                  </p>

                  <button
                    onClick={() => startEditing(article)}
                    disabled={loading}
                    style={{
                      padding: "10px 16px",
                      marginRight: 10,
                      cursor: "pointer",
                    }}
                  >
                    ✏️ Redigera
                  </button>

                  <button
                    onClick={() => publishArticle(article.id)}
                    disabled={loading}
                    style={{
                      padding: "10px 16px",
                      cursor: "pointer",
                    }}
                  >
                    🟢 Publicera
                  </button>
                </>
              )}
            </article>
          ))
        )}
      </section>

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