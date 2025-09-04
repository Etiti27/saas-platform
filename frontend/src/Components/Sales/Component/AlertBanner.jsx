import { useState } from "react";
export const AlertBanner = ({ title, message, status, onClose, details, BRAND }) => {
    const [showDetails, setShowDetails] = useState(false);
    return (
      <div className="rounded-xl border px-4 py-3 text-sm shadow-sm mb-3"
        style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#991b1b' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold">{title}{status ? ` (HTTP ${status})` : ''}</div>
            <div className="mt-0.5">{message}</div>
            {details && (
              <button
                type="button"
                onClick={() => setShowDetails((v) => !v)}
                className="mt-2 text-xs underline underline-offset-2"
                style={{ color: BRAND.primary }}
              >
                {showDetails ? 'Hide details' : 'Show details'}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs"
            style={{ background: BRAND.tint, color: BRAND.primary }}
          >
            Dismiss
          </button>
        </div>
        {showDetails && details && (
          <pre className="mt-2 max-h-48 overflow-auto rounded-lg p-2 text-xs"
               style={{ background: '#fff', border: '1px solid #fde2e2', color: '#334155' }}>
  {details}
          </pre>
        )}
      </div>
    );
  };