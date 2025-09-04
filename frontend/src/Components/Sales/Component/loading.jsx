// Loader.jsx
export function LoadingFullScreen({ text = "Loading…" }) {
    return (
      <div
        className="fixed inset-0 z-50 grid place-items-center bg-white/70 backdrop-blur-sm"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div
            className="h-12 w-12 rounded-full border-4 animate-spin"
            style={{
              borderColor: "#D3E2FD",
              borderTopColor: "#224765",
            }}
          />
          {/* Text */}
          <p className="text-sm" style={{ color: "#224765" }}>{text}</p>
        </div>
        <span className="sr-only">Loading</span>
      </div>
    );
  }
  