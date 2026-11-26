/** Title block at the top of every admin page. */
export default function PageHeading({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">{title}</h1>
                {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
            </div>
            {action}
        </div>
    );
}
