import React, { useId } from 'react';

export const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  id,
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
  helper, // optional helper text
}) => {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className={`group ${disabled ? 'opacity-60' : ''}`}>
      <label
        htmlFor={inputId}
        className="block mb-1 font-medium text-[#224765]"
      >
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
        {error && <span className="text-red-600 ml-2 text-sm">{error}</span>}
      </label>

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` : helper ? `${inputId}-help` : undefined
        }
        className={[
          'w-full rounded-lg border px-3 py-2 transition',
          'focus:outline-none focus:ring-2 focus:ring-[#224765] focus:border-[#224765]',
          error ? 'border-red-500 ring-red-200' : 'border-[#D3E2FD] bg-white',
          className,
        ].join(' ')}
      />

      {!error && helper && (
        <p id={`${inputId}-help`} className="mt-1 text-xs text-[#224765]/70">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export const FileInputField = ({
  label,
  accept,
  onChange,
  error,
  fileName,
  id,
  required = false,
  disabled = false,
  className = '',
}) => {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className={`group ${disabled ? 'opacity-60' : ''}`}>
      <label
        htmlFor={inputId}
        className="block mb-1 font-medium text-[#224765]"
      >
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
        {error && <span className="text-red-600 ml-2 text-sm">{error}</span>}
      </label>

      {/* Pretty file control */}
      <label
        htmlFor={inputId}
        className={[
          'relative flex items-center justify-between gap-3',
          'rounded-lg border px-3 py-2 cursor-pointer transition',
          error
            ? 'border-red-500 ring-1 ring-red-200'
            : 'border-dashed border-[#D3E2FD] hover:border-[#224765] hover:ring-1 hover:ring-[#D3E2FD]',
          className,
        ].join(' ')}
      >
        <span className="truncate text-sm text-[#224765]">
          {fileName || 'Choose a file…'}
        </span>
        <span className="inline-flex shrink-0 rounded-md bg-[#224765] px-3 py-1 text-xs font-semibold text-white">
          Browse
        </span>
      </label>

      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />

      {fileName && (
        <p className="mt-1 text-xs text-[#224765]/70">
          Selected file: {fileName}
        </p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};


export const RadioGroup = ({
  label,
  name,
  value,
  onChange,               // (val) => void
  options = [],           // strings or { value, label }
  error,
  columns = 2,
  required = false,
}) => {
  const groupId = useId();
  const toOpt = (opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt;

  return (
    <fieldset className="w-full">
      <legend className="block mb-2 font-medium text-[#224765]">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
        {error && <span className="text-red-600 ml-2 text-sm">{error}</span>}
      </legend>

      <div
        className={`grid gap-2`}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        role="radiogroup"
        aria-labelledby={groupId}
      >
        {options.map((opt) => {
          const o = toOpt(opt);
          const id = `${name}-${o.value}`;
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              htmlFor={id}
              className={[
                'flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition',
                checked
                  ? 'border-[#224765] ring-2 ring-[#D3E2FD]'
                  : 'border-[#D3E2FD] hover:border-[#224765]',
              ].join(' ')}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                onChange={(e) => onChange(e.target.value)}
                className="h-4 w-4 accent-[#224765]"
              />
              <span className="text-sm text-[#224765]">{o.label}</span>
            </label>
          );
        })}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </fieldset>
  );
};
