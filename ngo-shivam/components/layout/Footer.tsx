import Image from "next/image";
import Link from "next/link";

/* ============================== CONTENT ============================== */
const ORG = {
    fullName: "Shivam Jan Swasthya Evem Sarwangin Vikash Kendra",
    title: "Shivam Jan Swasthya",
    subtitle: "Evem Sarwangin Vikash Kendra",
    logo: "/logo/Shivam Ngo Icon.png",
};

/** Big faded text at the bottom. Its size auto-fits the width. */
const WATERMARK = "Shivam Kendra";

/** Credit line at the very bottom. Set `href` to your portfolio / profile link. */
const CREDIT = {
    label: "Designed & developed by",
    name: "Root Technology",
    href: "https://roottechnology.in",
};

type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
    {
        title: "Pages",
        links: [
            { label: "Home", href: "#home" },
            { label: "Gallery", href: "#gallery" },
            { label: "About", href: "#about" },
            { label: "Activities", href: "#activities" },
            { label: "Contact", href: "#contact" },
        ],
    },
    {
        title: "Socials",
        links: [
            { label: "Facebook", href: "#", external: true },
            { label: "Instagram", href: "#", external: true },
            { label: "YouTube", href: "#", external: true },
            { label: "Twitter", href: "#", external: true },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Donation Policy", href: "/donation-policy" },
        ],
    },
    {
        title: "Get Involved",
        links: [
            { label: "Donate", href: "#donate" },
            { label: "Be a Volunteer", href: "#volunteer" },
            { label: "Login", href: "/login" },
        ],
    },
];
/* ===================================================================== */

/**
 * Cache Components forbids reading the current time during prerender, so the
 * year lives in its own cached component. It is rendered into the static shell
 * and refreshed when the cache revalidates (so it rolls over after New Year).
 */
async function CopyrightYear() {
    "use cache";
    return <>{new Date().getFullYear()}</>;
}

export default function Footer() {
    return (
        <footer className="w-full border-t border-border bg-background">
            <div className="mx-auto max-w-7xl px-6 pt-16">
                <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
                    {/* Brand + copyright */}
                    <div className="max-w-sm">
                        <Link href="#home" className="flex items-center gap-3">
                            <Image
                                src={ORG.logo}
                                alt={`${ORG.title} logo`}
                                width={40}
                                height={40}
                                className="h-10 w-10 object-contain"
                            />
                            <span className="flex flex-col leading-tight">
                                <span className="text-base font-bold text-brand-dark">
                                    {ORG.title}
                                </span>
                                <span className="text-xs font-medium text-primary">
                                    {ORG.subtitle}
                                </span>
                            </span>
                        </Link>
                        <p className="mt-6 text-sm text-muted-foreground">
                            &copy; <CopyrightYear /> {ORG.fullName}. All rights reserved.
                        </p>
                    </div>

                    {/* Link columns */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-10 sm:grid-cols-4">
                        {COLUMNS.map((col) => (
                            <nav key={col.title} aria-label={col.title}>
                                <h3 className="text-sm font-semibold text-foreground">
                                    {col.title}
                                </h3>
                                <ul className="mt-5 space-y-4">
                                    {col.links.map((link) => (
                                        <li key={link.label}>
                                            {link.external ? (
                                                <a
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                                                >
                                                    {link.label}
                                                </a>
                                            ) : (
                                                <Link
                                                    href={link.href}
                                                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                                                >
                                                    {link.label}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>
                </div>

                {/* Big faded watermark */}
                <div
                    aria-hidden
                    className="@container mt-16 w-full select-none overflow-hidden"
                >
                    <p
                        className="whitespace-nowrap bg-linear-to-b from-primary/20 to-primary/5 bg-clip-text pb-[0.04em] text-center font-bold leading-[0.85] tracking-tighter text-transparent"
                        style={{ fontSize: `${92 / (WATERMARK.length * 0.58)}cqw` }}
                    >
                        {WATERMARK}
                    </p>
                </div>

                {/* Credit */}
                <div className="flex flex-col items-center justify-between gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row">
                    <p className="flex items-center gap-1.5">
                        Made with
                        <span role="img" aria-label="love" className="text-cta">
                            &hearts;
                        </span>
                        for a healthier community
                    </p>
                    <p>
                        {CREDIT.label}{" "}
                        <a
                            href={CREDIT.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-brand-dark transition-colors hover:text-primary"
                        >
                            {CREDIT.name}
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}