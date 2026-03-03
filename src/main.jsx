import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error('Root element "#root" not found. Check index.html.');
}

// Shows a full-page error UI if anything crashes during render.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error("💥 React crashed:", error);
    console.error("Component stack:", info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            padding: 24,
            background: "#0f172a",
            color: "#e2e8f0",
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 20, color: "#f59e0b" }}>
            💥 App crashed
          </h1>

          <p style={{ color: "#94a3b8", marginTop: 8 }}>
            Fix the error, save the file, and Vite will hot-reload.
          </p>

          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 10,
              background: "#111827",
              border: "1px solid #334155",
              whiteSpace: "pre-wrap",
              overflowX: "auto",
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 8, color: "#e2e8f0" }}>
              Error
            </div>
            <code style={{ color: "#fca5a5" }}>
              {String(this.state.error?.stack || this.state.error)}
            </code>

            {this.state.info?.componentStack && (
              <>
                <div
                  style={{
                    fontWeight: 800,
                    marginTop: 16,
                    marginBottom: 8,
                    color: "#e2e8f0",
                  }}
                >
                  Component stack
                </div>
                <code style={{ color: "#93c5fd" }}>
                  {this.state.info.componentStack}
                </code>
              </>
            )}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button
              onClick={() => location.reload()}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontWeight: 800,
                background: "#7c3aed",
                color: "white",
              }}
            >
              Reload
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(
                  String(this.state.error?.stack || this.state.error)
                );
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #334155",
                cursor: "pointer",
                fontWeight: 800,
                background: "#1e293b",
                color: "#e2e8f0",
              }}
            >
              Copy error
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Optional: catch non-React errors too
window.addEventListener("error", (e) => {
  console.error("🌩️ Window error:", e.error || e.message, e);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("🚫 Unhandled promise rejection:", e.reason, e);
});

// NOTE: For your app, I’d skip StrictMode to avoid “double effects” confusion.
ReactDOM.createRoot(rootEl).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);