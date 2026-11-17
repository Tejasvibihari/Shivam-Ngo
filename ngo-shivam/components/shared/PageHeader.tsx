import Breadcrumbs, { type BreadcrumbItem } from "@/components/shared/Breadcrumbs";

type PageHeaderProps = {
    title: React.ReactNode;
    eyebrow?: string;
    description?: string;
    /** breadcrumb trail AFTER "Home" */
    breadcrumbs: BreadcrumbItem[];
};

/**
 * Standard header for inner pages: breadcrumbs + eyebrow + h1 + intro.
 * Top padding clears the fixed floating navbar.
 */
export default function PageHeader({ title, eyebrow, description, breadcrumbs }: PageHeaderProps) {
    return (
        <header className="relative w-full overflow-hidden bg-brand-light px-6 pb-14 pt-36 sm:pb-16 sm:pt-40">
            <div aria-hidden className="absolute -left-24 top-10 size-72 rounded-full bg-primary/15 blur-3xl" />
            <div aria-hidden className="absolute -right-24 bottom-0 size-80 rounded-full bg-cta/20 blur-3xl" />

            <div className="relative mx-auto max-w-6xl">
                <Breadcrumbs items={breadcrumbs} />
                {eyebrow && (
                    <span className="mt-6 inline-block rounded-full border border-primary/30 bg-background/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                        {eyebrow}
                    </span>
                )}
                <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-brand-dark sm:text-5xl">
                    {title}
                </h1>
                {description && (
                    <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">{description}</p>
                )}
            </div>
        </header>
    );
}
