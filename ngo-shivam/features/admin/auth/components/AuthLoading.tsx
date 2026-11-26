import { IconLoader2 } from "@tabler/icons-react";

/** Full-screen state shown while the session is being checked (and while redirecting). */
export default function AuthLoading({ label = "Checking your session..." }: { label?: string }) {
    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-brand-light px-4">
            <p role="status" aria-live="polite" className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                <IconLoader2 size={22} aria-hidden className="animate-spin text-primary" />
                {label}
            </p>
        </main>
    );
}
