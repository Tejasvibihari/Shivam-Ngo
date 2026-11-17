import Link from "next/link";
import { IconChevronRight, IconHome } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
    label: string;
    /** omit on the last item: it is the current page and is not a link */
    href?: string;
};

type BreadcrumbsProps = {
    items: BreadcrumbItem[];
    /** prepend a "Home" crumb (default true) */
    showHome?: boolean;
    className?: string;
};

/**
 * Reusable breadcrumb trail (server component).
 *
 *   <Breadcrumbs items={[{ label: "Gallery" }]} />                       Home / Gallery
 *   <Breadcrumbs items={[{ label: "Projects", href: "/projects" },
 *                        { label: "Clean Water" }]} />                   Home / Projects / Clean Water
 */
export default function Breadcrumbs({ items, showHome = true, className }: BreadcrumbsProps) {
    const trail: BreadcrumbItem[] = showHome ? [{ label: "Home", href: "/" }, ...items] : items;

    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                {trail.map((item, i) => {
                    const isLast = i === trail.length - 1;
                    const isHome = showHome && i === 0;
                    return (
                        <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
                            {isLast || !item.href ? (
                                <span aria-current={isLast ? "page" : undefined} className="font-semibold text-brand-dark">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 rounded-sm transition-colors hover:text-primary",
                                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                                    )}
                                >
                                    {isHome && <IconHome size={15} aria-hidden />}
                                    {item.label}
                                </Link>
                            )}
                            {!isLast && <IconChevronRight size={14} aria-hidden className="text-muted-foreground/60" />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
