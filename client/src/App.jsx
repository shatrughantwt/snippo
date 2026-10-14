import { useState, useEffect } from "react";
import { authAPI, snippetsAPI } from "./api";
import "./App.css";

const LANGUAGES = [
  { name: "JavaScript", ext: "js", color: "#F1E05A" },
  { name: "TypeScript", ext: "ts", color: "#3178C6" },
  { name: "Python", ext: "py", color: "#3572A5" },
  { name: "Go", ext: "go", color: "#00ADD8" },
  { name: "Rust", ext: "rs", color: "#DEA584" },
  { name: "HTML", ext: "html", color: "#E34C26" },
];

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = isRegister
        ? await authAPI.register(username, password)
        : await authAPI.login(username, password);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data.userId,
          username: response.data.username,
        }),
      );
      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">{isRegister ? "Register" : "Login"}</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="field-error is-visible">{error}</div>}
        <button type="submit" className="submit-btn">
          {isRegister ? "Register" : "Login"}
        </button>
      </form>
      <div className="toggle-text">
        {isRegister ? "Already have an account? " : "Don't have an account? "}
        <span
          className="toggle-link"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Login" : "Register"}
        </span>
      </div>
    </div>
  );
}

function SnippetEditor({ user, onLogout }) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [currentLang, setCurrentLang] = useState(LANGUAGES[0]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [titleError, setTitleError] = useState(false);
  const [codeError, setCodeError] = useState(false);

  const lineCount = code.split("\n").length;
  const cursorPos = code.length;

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = async () => {
    try {
      const response = await snippetsAPI.getAll();
      setSnippets(response.data);
    } catch (err) {
      console.error("Failed to load snippets:", err);
    }
  };

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2200);
  };

  const handleCreateSnippet = async () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    if (!code.trim()) {
      setCodeError(true);
      return;
    }

    const firstLine = code.split("\n").find((l) => l.trim().length) || code;
    const snippetData = {
      title,
      code,
      lang: currentLang.name,
      ext: currentLang.ext,
      color: currentLang.color,
      lines: lineCount,
      preview: firstLine.trim(),
    };

    try {
      await snippetsAPI.create(snippetData);
      setTitle("");
      setCode("");
      setTitleError(false);
      setCodeError(false);
      showToast("Snippet created");
      loadSnippets();
    } catch (err) {
      console.error("Failed to create snippet:", err);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleCreateSnippet();
    }
  };

  const handleDeleteSnippet = async (id) => {
    try {
      await snippetsAPI.delete(id);
      showToast("Snippet deleted");
      loadSnippets();
    } catch (err) {
      console.error("Failed to delete snippet:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  };

  const escapeHtml = (str) => {
    return str.replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[m],
    );
  };

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">&lt;/&gt;</div>
          <div className="brand-name">Snippets</div>
        </div>
        <button className="logout-btn" onClick={handleLogout} type="button">
          Log out
        </button>
      </div>

      <div className="editor-window">
        <div className="titlebar">
          <div className="dots">
            <span className="dot dot-amber"></span>
            <span className="dot dot-mint"></span>
            <span className="dot dot-accent"></span>
          </div>
          <div className="tab">
            <span
              className="tab-dot"
              style={{ background: currentLang.color }}
            ></span>
            <span>
              {title.trim() || "untitled"}.{currentLang.ext}
            </span>
          </div>
          <div className="titlebar-spacer"></div>
          <div className="lang-select">
            <button
              className="lang-trigger"
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
            >
              <span
                className="lang-dot"
                style={{ background: currentLang.color }}
              ></span>
              <span>{currentLang.name}</span>
              <span className="chevron">⌄</span>
            </button>
            <ul className={`lang-menu ${langMenuOpen ? "" : "hidden"}`}>
              {LANGUAGES.map((lang) => (
                <li
                  key={lang.name}
                  className={`lang-option ${currentLang.name === lang.name ? "is-active" : ""}`}
                  onClick={() => {
                    setCurrentLang(lang);
                    setLangMenuOpen(false);
                  }}
                >
                  <span
                    className="lang-option-dot"
                    style={{ background: lang.color }}
                  ></span>
                  {lang.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="field-row">
          <span
            className="field-dot"
            style={{ background: currentLang.color }}
          ></span>
          <input
            className="title-input"
            type="text"
            placeholder="Name this snippet"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError(false);
            }}
            autoComplete="off"
          />
        </div>
        <div className={`field-error ${titleError ? "is-visible" : ""}`}>
          Give the snippet a name before saving.
        </div>

        <div className="code-area">
          <div className="gutter">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <textarea
            className="code-input"
            placeholder="Write or paste your code..."
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (e.target.value.trim()) setCodeError(false);
            }}
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />
        </div>
        <div className={`field-error ${codeError ? "is-visible" : ""}`}>
          Add some code before saving — an empty snippet isn't much use.
        </div>

        <div className="statusbar">
          <span>
            Ln {lineCount}, Col {cursorPos + 1}
          </span>
          <span>
            {lineCount} line{lineCount === 1 ? "" : "s"}
          </span>
          <span>
            {code.length} char{code.length === 1 ? "" : "s"}
          </span>
          <div className="statusbar-spacer"></div>
          <span className="status-lang">
            <span
              className="status-lang-dot"
              style={{ background: currentLang.color }}
            ></span>
            <span>{currentLang.name}</span>
          </span>
        </div>
      </div>

      <div className="actions">
        <span className="kbd-hint">
          <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd> to save
        </span>
        <button
          className="create-btn"
          onClick={handleCreateSnippet}
          type="button"
        >
          Create snippet
        </button>
      </div>

      <div className="recent">
        <div className="recent-heading">Recent snippets</div>
        <div className="recent-grid">
          {snippets.map((snippet) => (
            <div key={snippet._id} className="snippet-card">
              <div className="card-top">
                <span
                  className="card-dot"
                  style={{ background: snippet.color }}
                ></span>
                <span className="card-title">
                  {escapeHtml(snippet.title)}.{snippet.ext}
                </span>
              </div>
              <div className="card-preview">{escapeHtml(snippet.preview)}</div>
              <div className="card-meta">
                {snippet.lang} · {snippet.lines} line
                {snippet.lines === 1 ? "" : "s"}
              </div>
              <button
                onClick={() => handleDeleteSnippet(snippet._id)}
                style={{
                  marginTop: "8px",
                  padding: "4px 8px",
                  fontSize: "11px",
                  background: "var(--panel-2)",
                  border: "1px solid var(--line)",
                  color: "var(--danger)",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={`toast ${toast.visible ? "is-visible" : ""}`}>
        <span className="toast-dot"></span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = () => {
    const userData = localStorage.getItem("user");
    setUser(JSON.parse(userData));
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {user ? (
        <SnippetEditor user={user} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
