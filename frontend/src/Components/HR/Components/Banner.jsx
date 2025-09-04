export const Banner = ({ type = 'info', message, onClose, children }) => {
  const styles =
    type === 'success'
      ? 'bg-green-50 border-green-200 text-green-800'
      : type === 'error'
      ? 'bg-red-50 border-red-200 text-red-800'
      : 'bg-blue-50 border-blue-200 text-blue-800';
  return (
    <div className={`mb-4 rounded-xl border p-3 ${styles} flex items-center justify-between gap-3`}>
      <div className="text-sm">
        {children || message}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-xs rounded-md px-2 py-1 ring-1 ring-black/10 hover:bg-white/40"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};