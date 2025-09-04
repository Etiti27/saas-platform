import {
    CreditCard, Banknote, Wallet2, Landmark, FileDown,
    AlertCircle, Check, X, Info
  } from 'lucide-react';
export const Input = (props) => (
    <input
      {...props}
      className={`w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#224765] ${props.className||''}`}
    />
  );
  
  export const Textarea = (props) => (
    <textarea
      {...props}
      className="w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#224765]"
    />
  );
  
  export const Field = ({ label, hint, error, children }) => (
    <div className="py-3 grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-6">
      <div>
        <div className="text-sm font-medium text-[#224765]">{label}</div>
        {hint && <div className="text-xs text-[#224765]/70">{hint}</div>}
      </div>
      <div className="md:col-span-2">
        {children}
        {error ? (
          <div className="mt-1 inline-flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </div>
        ) : null}
      </div>
    </div>
  );
  
  export const Segmented = ({ value, onChange, options }) => (
    <div className="inline-flex rounded-xl border border-[#224765]/20 bg-white p-1 shadow-sm">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
            value === o.value ? 'bg-[#D3E2FD] text-[#224765]' : 'text-[#224765] hover:bg-[#D3E2FD]/40'
          }`}
        >
          {o.icon ? <o.icon className="h-4 w-4" /> : null}
          {o.label}
        </button>
      ))}
    </div>
  );
  
  export const ChipGroup = ({ options, value, onChange }) => (
    <div className="flex flex-wrap gap-2">
      {options.map(o => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition
              ${active ? 'bg-[#224765] text-white' : 'bg-[#D3E2FD] text-[#224765] hover:bg-[#D3E2FD]/70'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
  
  export const Dropzone = ({ onFile }) => (
    <label className="block cursor-pointer rounded-xl border border-dashed border-[#224765]/30 bg-white/70 px-3 py-6 text-center text-sm text-[#224765] hover:bg-[#D3E2FD]/30">
      <div className="flex items-center justify-center gap-2">
        <FileDown className="h-4 w-4" />
        <span>Drop file or click to upload (image/PDF)</span>
      </div>
      <input
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={(e) => onFile?.(e.target.files?.[0] || null)}
      />
    </label>
  );
  
  export const Card = ({ title, subtitle, right, children, className='' }) => (
    <section className={`bg-white p-5 rounded-2xl shadow-xl ring-1 ring-[#224765]/10 ${className}`}>
      {(title || right || subtitle) && (
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-semibold text-[#224765]">{title}</h3>}
            {subtitle && <div className="text-xs text-[#224765]/70">{subtitle}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
  
  export const Banner = ({ type='info', children, onClose }) => {
    const styles = type === 'success'
      ? 'bg-green-50 border-green-200 text-green-800'
      : type === 'error'
      ? 'bg-red-50 border-red-200 text-red-800'
      : 'bg-blue-50 border-blue-200 text-blue-800';
    return (
      <div className={`mb-4 rounded-xl border p-3 ${styles} flex items-center justify-between gap-3`}>
        <div className="text-sm">{children}</div>
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