import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [summary, setSummary] = useState("Upload a PDF to generate summary");
  const [tags, setTags] = useState([]);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;
    setFile(uploaded);
    setPdfUrl(URL.createObjectURL(uploaded));
    setSummary("Generating summary…");
    setTags([]);
    setChat([]);
    uploadAndAnalyze(uploaded); // auto-trigger
  };

  const uploadAndAnalyze = async (fileObj = file) => {
    if (!fileObj) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", fileObj);

    try {
      const res = await fetch(`${BACKEND}/upload/`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSummary(data.summary || "No summary returned");
      setTags(data.tags || []);
    } catch (err) {
      setSummary("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion("");
    setChat((c) => [...c, { role: "user", text: q }]);

    try {
      const form = new FormData();
      form.append("question", q);
      const res = await fetch(`${BACKEND}/ask/`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      setChat((c) => [
        ...c,
        { role: "assistant", text: data.answer || JSON.stringify(data) },
      ]);
    } catch (err) {
      setChat((c) => [
        ...c,
        { role: "assistant", text: "Error: " + err.message },
      ]);
    }
  };

  return (
    <div className="app-wrapper">
      <header className="header">AskMyDoc</header>

      <main className="main-grid">
        {/* Summary + Tags */}
        <aside className="panel left fade-in">
          <h2>Summary</h2>
          <pre className="summary-box">{summary}</pre>

          <h2>Tags</h2>
          <div className="tags-box fade-in">
            {tags.map((t, i) => (
              <span key={i} className="tag-chip">
                {t}
              </span>
            ))}
          </div>
        </aside>

        {/* PDF Viewer */}
        <section className="pdf-viewer fade-in">
          {pdfUrl ? (
            <embed src={pdfUrl} type="application/pdf" className="pdf-embed" />
          ) : (
            <p className="placeholder">Choose a PDF to preview…</p>
          )}
        </section>

        {/* Chat Bot */}
        <aside className="panel right fade-in">
          <h2>Ask about PDF</h2>
          <div className="chat-box">
            {chat.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askQuestion()}
              placeholder="Type a question…"
            />
            <button onClick={askQuestion}>Ask</button>
          </div>
        </aside>
      </main>

      <footer className="footer">
        <label className="file-input-label">
          Choose PDF
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="file-input"
          />
        </label>
      </footer>
    </div>
  );
}