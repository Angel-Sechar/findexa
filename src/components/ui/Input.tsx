import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
};

export function Input({
  className,
  error,
  helperText,
  id,
  label,
  required,
  type = "text",
  ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  const inputClasses = [
    "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    error
      ? "border-[#D85A30] focus-visible:outline-[#D85A30]"
      : "border-slate-300 focus-visible:outline-[#1D9E75]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-800" htmlFor={inputId}>
        {label}
        {required ? <span className="ml-1 text-[#D85A30]">*</span> : null}
      </label>

      <input className={inputClasses} id={inputId} required={required} type={type} {...props} />

      {error ? <p className="text-sm text-[#D85A30]">{error}</p> : null}
      {!error && helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}
