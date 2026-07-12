import type { FormState } from "@/lib/validations";
import { cn } from "@/lib/utils";

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) return null;

  return (
    <div
      className={cn(
        "rounded-xl px-4 py-3 text-sm",
        state.status === "success"
          ? "bg-green-50 text-green-800"
          : "bg-red-50 text-red-800",
      )}
      role="status"
    >
      {state.message}
    </div>
  );
}
