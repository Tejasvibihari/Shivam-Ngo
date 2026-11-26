/** One number on the dashboard, with a label and an icon. The value always comes from the API. */
export default function StatCard({
    label,
    value,
    hint,
    icon: Icon,
}: {
    label: string;
    value: number | string;
    hint?: string;
    icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-lg shadow-primary/5">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-muted-foreground">{label}</p>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon size={20} aria-hidden />
                </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-brand-dark">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}
