import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-espresso/20 bg-white/60 px-4 py-3 text-sm text-espresso placeholder:text-mist transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium text-espresso"
    >
      {children}
      {required && <span className="ml-0.5 text-gold-dark">*</span>}
    </label>
  );
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return <p className="mt-1.5 text-xs text-red-700">{messages[0]}</p>;
}

type BaseProps = {
  label: string;
  name: string;
  required?: boolean;
  errors?: string[];
};

export function InputField({
  label,
  name,
  required,
  errors,
  className,
  ...rest
}: BaseProps & ComponentProps<"input">) {
  return (
    <div>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <input
        id={name}
        name={name}
        className={cn(fieldBase, className)}
        {...rest}
      />
      <FieldError messages={errors} />
    </div>
  );
}

export function TextareaField({
  label,
  name,
  required,
  errors,
  className,
  ...rest
}: BaseProps & ComponentProps<"textarea">) {
  return (
    <div>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <textarea
        id={name}
        name={name}
        className={cn(fieldBase, "min-h-32 resize-y", className)}
        {...rest}
      />
      <FieldError messages={errors} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  required,
  errors,
  children,
  className,
  ...rest
}: BaseProps & ComponentProps<"select">) {
  return (
    <div>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <select
        id={name}
        name={name}
        className={cn(fieldBase, className)}
        {...rest}
      >
        {children}
      </select>
      <FieldError messages={errors} />
    </div>
  );
}
