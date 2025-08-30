export function Checkbox({ label = "I confirm this action", checked, onChange, disabled }) {
  return (
    <div className="w-full flex justify-center my-4">
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="h-5 w-5 accent-red-600"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <span
          className={`text-base font-semibold`}
        >
          {label}
        </span>
      </label>
    </div>
  );
}
