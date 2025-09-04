export const ErrorBanner = ({ error, onRetry, compact }) => {
    if (!error) return null;
    const msg = error.message || 'Something went wrong.';
    return (
      <div className={`mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 ${compact ? '' : 'flex items-center justify-between gap-4'}`}>
        <div className="text-sm">
          <strong className="mr-1">Error:</strong>
          <span>{msg}</span>
          {error.status ? <span className="ml-1 text-red-700/70">[{error.status}]</span> : null}
        </div>
        {onRetry && !compact && (
          <button
            onClick={onRetry}
            className="rounded-lg bg-red-600/90 px-3 py-1 text-white text-xs hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    );
  };