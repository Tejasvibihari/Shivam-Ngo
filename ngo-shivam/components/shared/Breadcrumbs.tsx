import Link from "next/link";
import { IconChevronRight, IconHome } from "@tabler/icons-react";
import JsonLd from "@/components/shared/JsonLd";
import { absoluteUrl } from "@/lib/site";
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
    /**
     * Big faded text on the right. Defaults to the current page's label (last item).
     * Pass a string to override it, or `false` to turn it off.
     */
    watermark?: string | false;
    className?: string;
};

/**
 * Reusable breadcrumb trail (server component).
 *
 *   <Breadcrumbs items={[{ label: "Gallery" }]} />                       Home / Gallery
 *   <Breadcrumbs items={[{ label: "Projects", href: "/projects" },
 *                        { label: "Clean Water" }]} />                   Home / Projects / Clean Water
 *
 * The watermark is absolutely positioned, so it anchors to the nearest positioned
 * ancestor (the `relative` container in PageHeader) and is clipped by the header.
 */
export default function Breadcrumbs({ items, showHome = true, watermark, className }: BreadcrumbsProps) {
    const trail: BreadcrumbItem[] = showHome ? [{ label: "Home", href: "/" }, ...items] : items;
    const watermarkText = watermark === false ? null : (watermark ?? items[items.length - 1]?.label);

    // BreadcrumbList structured data: lets Google show "Home > Activities > Sanitation" in results.
    // The last crumb is the current page, so it has no URL (allowed by schema.org).
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            ...(item.href ? { item: absoluteUrl(item.href) } : {}),
        })),
    };

    return (
        <>
            <JsonLd data={breadcrumbJsonLd} />
            {watermarkText && (
                <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-8 right-0 z-0 hidden max-w-full select-none whitespace-nowrap bg-linear-to-r from-primary/30 to-primary/0 bg-clip-text pb-[0.04em] text-[5.5rem] font-bold leading-[0.85] tracking-tighter text-transparent sm:block md:text-[8rem] lg:text-[11rem]"
                >
                    {watermarkText}
                </span>
            )}

            <nav aria-label="Breadcrumb" className={cn("relative z-10", className)}>
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
        </>
    );
}