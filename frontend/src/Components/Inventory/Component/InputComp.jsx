export function Input({
  onChange,
  type = 'text',
  placeholder = '',
  value,           // optional (controlled)
  defaultValue,    // optional (uncontrolled)
  className = '',
  ...rest
}) {
  const props = {
    type,
    placeholder,
    className: `border p-2 rounded w-1/3 w-full sm:w-auto ${className}`,
    onChange,
    ...rest,
  };

  if (value !== undefined) {
    // Controlled input
    props.value = value;
    if (!onChange) props.readOnly = true; // avoid React warning if value without onChange
  } else if (defaultValue !== undefined) {
    // Uncontrolled input
    props.defaultValue = defaultValue;
  }

  return <input {...props} />;
}
