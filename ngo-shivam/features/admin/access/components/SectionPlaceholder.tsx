/**
 * Stand-in body for admin sections whose real screens come in later tasks. The
 * page itself is already role-protected by the page map (access/policy.ts), so
 * a section can be built behind its menu entry without touching access control.
 */
export default function SectionPlaceholder({ title, description }: { title: string; description: string }) {
    return (
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-border bg-card p-7 shadow-xl shadow-primary/10 sm:p-9">
            <h1 className="text-2xl font-bold tracking-tight text-brand-dark">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <p className="mt-4 text-sm text-muted-foreground">This section will be available soon.</p>
        </div>
    );
}
