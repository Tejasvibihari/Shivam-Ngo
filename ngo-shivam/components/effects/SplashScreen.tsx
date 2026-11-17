"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/* ============================== CONTENT ============================== */
const ORG = {
    title: "Shivam Jan Swasthya",
    subtitle: "Evem Sarwangin Vikash Kendra",
    logo: "/logo/Shivam Ngo Icon.png",
};

/** How long the splash stays on screen (ms). */
const DURATION = 3200;
/** Shorter run for people who prefer reduced motion. */
const DURATION_REDUCED = 1600;

type Period = "morning" | "afternoon" | "evening";

const GREETINGS: Record<Period, { en: string; hi: string }> = {
    morning: { en: "Good Morning", hi: "शुभ प्रभात" },
    afternoon: { en: "Good Afternoon", hi: "शुभ दोपहर" },
    evening: { en: "Good Evening", hi: "शुभ संध्या" },
};

/** 05:00–11:59 morning, 12:00–16:59 afternoon, everything else evening. */
function getPeriod(): Period {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "morning";
    if (h >= 12 && h < 17) return "afternoon";
    return "evening";
}

/*
 * The greeting depends on the visitor's clock, so it must only be read on the
 * client. useSyncExternalStore gives "" on the server / during hydration (no
 * mismatch, no Date access while prerendering) and the real period afterwards.
 */
const subscribe = () => () => {};
const getServerPeriod = () => "" as const;

/* ============================== NAMASTE ICON ============================== */
/** Animated folded-hands (namaste) icon sitting on a blooming lotus. */
function NamasteIcon({ reduced }: { reduced: boolean }) {
    const ease = [0.22, 1, 0.36, 1] as const;

    // One palm, drawn for the left side; the right palm is its mirror image.
    const palm =
        "M60 20 C51 29 43 50 43 70 C43 86 47 97 53 104 L60 104 Z";
    const fingerLines = [
        "M60 28 C54 38 49 54 48 72",
        "M60 40 C56 50 53 62 52.5 76",
    ];

    // Thumb tucked against the palm, so it reads as hands rather than a leaf.
    const thumb = "M56 90 C51 86 49 78 51 72 C55 74 58 82 58 90 Z";

    const petals = [-84, -56, -28, 0, 28, 56, 84];

    return (
        <svg
            viewBox="0 0 120 120"
            className="h-full w-full"
            role="img"
            aria-label="Namaste"
        >
            <defs>
                <linearGradient id="splash-palm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f6c48a" />
                    <stop offset="1" stopColor="#e39a56" />
                </linearGradient>
                <linearGradient id="splash-petal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#f29a1f" stopOpacity="0.95" />
                    <stop offset="1" stopColor="#f29a1f" stopOpacity="0.25" />
                </linearGradient>
            </defs>

            {/* Lotus: petals bloom outward behind the hands */}
            <g transform="translate(60 108)">
                {petals.map((angle, i) => (
                    <motion.ellipse
                        key={angle}
                        cx={0}
                        cy={-38}
                        rx={12}
                        ry={38}
                        fill="url(#splash-petal)"
                        style={{ transformOrigin: "0px 0px" }}
                        initial={{ rotate: 0, scale: 0.2, opacity: 0 }}
                        animate={{ rotate: angle, scale: 1, opacity: 1 }}
                        transition={{
                            duration: reduced ? 0.01 : 0.9,
                            delay: reduced ? 0 : 0.3 + Math.abs(i - 3) * 0.08,
                            ease,
                        }}
                    />
                ))}
            </g>

            {/* Hands + gentle bow (drawn smaller so the lotus frames them) */}
            <g transform="translate(60 106) scale(0.78) translate(-60 -106)">
            <motion.g
                style={{ transformOrigin: "60px 108px" }}
                animate={reduced ? undefined : { rotate: [0, 0, 5, 0, 0] }}
                transition={
                    reduced
                        ? undefined
                        : {
                              duration: 1.4,
                              delay: 1.5,
                              times: [0, 0.1, 0.45, 0.85, 1],
                              ease: "easeInOut",
                          }
                }
            >
                {/* Left palm */}
                <motion.g
                    style={{ transformOrigin: "60px 104px" }}
                    initial={{ rotate: reduced ? 0 : -30, x: reduced ? 0 : -8, opacity: 0 }}
                    animate={{ rotate: 0, x: 0, opacity: 1 }}
                    transition={{ duration: reduced ? 0.01 : 0.8, delay: reduced ? 0 : 0.7, ease }}
                >
                    <path d={palm} fill="url(#splash-palm)" stroke="#b9702f" strokeWidth="1.4" strokeLinejoin="round" />
                    <path d={thumb} fill="#eab077" stroke="#b9702f" strokeWidth="1" strokeLinejoin="round" />
                    {fingerLines.map((d) => (
                        <path key={d} d={d} fill="none" stroke="#b9702f" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" />
                    ))}
                </motion.g>

                {/* Right palm (mirror) */}
                <motion.g
                    style={{ transformOrigin: "60px 104px" }}
                    initial={{ rotate: reduced ? 0 : 30, x: reduced ? 0 : 8, opacity: 0 }}
                    animate={{ rotate: 0, x: 0, opacity: 1 }}
                    transition={{ duration: reduced ? 0.01 : 0.8, delay: reduced ? 0 : 0.7, ease }}
                >
                    <g transform="translate(120 0) scale(-1 1)">
                        <path d={palm} fill="url(#splash-palm)" stroke="#b9702f" strokeWidth="1.4" strokeLinejoin="round" />
                        <path d={thumb} fill="#eab077" stroke="#b9702f" strokeWidth="1" strokeLinejoin="round" />
                        {fingerLines.map((d) => (
                            <path key={d} d={d} fill="none" stroke="#b9702f" strokeOpacity="0.55" strokeWidth="1" strokeLinecap="round" />
                        ))}
                    </g>
                </motion.g>

                {/* Sleeve / wrist band */}
                <motion.rect
                    x={42}
                    y={101}
                    width={36}
                    height={9}
                    rx={4.5}
                    fill="#1b805c"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: reduced ? 0 : 0.7 }}
                />
            </motion.g>
            </g>
        </svg>
    );
}

/* ============================== SPLASH ============================== */
export default function SplashScreen() {
    const reduced = !!useReducedMotion();
    const [visible, setVisible] = useState(true);
    const period = useSyncExternalStore(subscribe, getPeriod, getServerPeriod);
    const greeting = period ? GREETINGS[period] : null;

    // Hide after a few seconds.
    useEffect(() => {
        const t = setTimeout(() => setVisible(false), reduced ? DURATION_REDUCED : DURATION);
        return () => clearTimeout(t);
    }, [reduced]);

    // Lock page scroll while the splash is up.
    useEffect(() => {
        if (!visible) return;
        const html = document.documentElement;
        const prev = html.style.overflow;
        html.style.overflow = "hidden";
        return () => {
            html.style.overflow = prev;
        };
    }, [visible]);

    const total = (reduced ? DURATION_REDUCED : DURATION) / 1000;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="splash"
                    role="status"
                    aria-live="polite"
                    aria-label="Loading"
                    className="fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,#e0f3ec_0%,#ffffff_60%)] px-6 text-center dark:bg-[radial-gradient(ellipse_at_top,#1a302c_0%,#0e1f1b_65%)]"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: reduced ? 0 : "-6%", transition: { duration: 0.6, ease: "easeInOut" } }}
                >
                    {/* soft glowing rings behind the content */}
                    {!reduced &&
                        [0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                aria-hidden
                                className="pointer-events-none absolute h-72 w-72 rounded-full border border-primary/25"
                                initial={{ scale: 0.4, opacity: 0 }}
                                animate={{ scale: [0.4, 2.2], opacity: [0.5, 0] }}
                                transition={{ duration: 2.4, delay: 0.4 + i * 0.7, repeat: Infinity, ease: "easeOut" }}
                            />
                        ))}

                    {/* Logo */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: reduced ? 0.01 : 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="relative z-10"
                    >
                        <Image
                            src={ORG.logo}
                            alt={`${ORG.title} logo`}
                            width={96}
                            height={96}
                            priority
                            className="h-20 w-20 object-contain sm:h-24 sm:w-24"
                        />
                    </motion.div>

                    {/* Name */}
                    <motion.h1
                        initial={{ y: 14, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: reduced ? 0.01 : 0.6, delay: reduced ? 0 : 0.3 }}
                        className="relative z-10 mt-4 flex flex-col leading-tight"
                    >
                        <span className="text-xl font-bold text-brand-dark sm:text-2xl">{ORG.title}</span>
                        <span className="text-xs font-medium tracking-wide text-primary sm:text-sm">{ORG.subtitle}</span>
                    </motion.h1>

                    {/* Namaste animation */}
                    <div className="relative z-10 mt-5 h-36 w-36 sm:h-40 sm:w-40">
                        <NamasteIcon reduced={reduced} />
                    </div>

                    {/* Greeting (time based; empty until the client knows the time) */}
                    <div className="relative z-10 mt-4 min-h-[5.5rem]">
                        {greeting && (
                            <motion.div
                                initial={{ y: 12, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: reduced ? 0.01 : 0.6, delay: reduced ? 0 : 0.9 }}
                            >
                                <p className="text-3xl font-bold text-foreground sm:text-4xl">नमस्ते</p>
                                <p className="mt-1 text-lg font-semibold text-cta sm:text-xl">
                                    {greeting.en} <span className="text-muted-foreground">· {greeting.hi}</span>
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                                    Welcome! We&apos;re glad you&apos;re here.
                                </p>
                            </motion.div>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/10">
                        <motion.div
                            className="h-full origin-left bg-primary"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: total, ease: "linear" }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
