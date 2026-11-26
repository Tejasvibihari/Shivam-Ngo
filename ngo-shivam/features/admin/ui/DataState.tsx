import { IconAlertCircle, IconLoader2 } from "@tabler/icons-react";
import { adminSecondaryButtonClass } from "@/features/admin/ui/styles";

/** Inline loading indicator for a part of a page that waits for the API. */
export function LoadingBlock({ label = "Loading..." }: { label?: string }) {
    return (
        <p role="status" aria-live="polite" className="flex items-center gap-2 py-8 text-sm font-semibold text-muted-foreground">
            <IconLoader2 size={20} aria-hidden className="animate-spin text-primary" />
            {label}
        </p>
    );
}

/** Inline error with a retry button. */
export function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
            <IconAlertCircle size={20} aria-hidden className="shrink-0" />
            <span className="min-w-0 flex-1">{message}</span>
            <button type="button" onClick={onRetry} className={adminSecondaryButtonClass}>
                Try again
            </button>
        </div>
    );
}
