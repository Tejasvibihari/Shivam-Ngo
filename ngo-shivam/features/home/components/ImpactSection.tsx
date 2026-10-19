"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
    AnimatePresence,
    animate,
    motion,
    useAnimationFrame,
    useInView,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
    type MotionValue,
} from "motion/react";
import {
    IconCalendarEvent,
    IconHeartHandshake,
    IconMapPin,
    IconSparkles,
    IconUsers,
    IconUsersGroup,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/* ============================== CONTENT ============================== */
/** The year the organisation was established. */
const ESTABLISHED = 2004;
/** Logo shown in the center (file in /public). */
const LOGO = "/logo/Shivam Ngo Icon.png";
/** Seconds for one full turn around the logo. */
const ORBIT_SECONDS = 70;
/** Orbit radius as a % of the orbit box width. */
const ORBIT_RADIUS = 40;

/**
 * ONLY fill these in with numbers the organisation can verify with records.
 * Leave a field out and its circle shows "—" instead of a number.
 * Example:  { peopleReached: 1500, volunteers: 40 }
 */
const VERIFIED: {
    peopleReached?: number;
    initiatives?: number;
    areasCovered?: number;
    volunteers?: number;
} = {};
/* ===================================================================== */

type StatIcon = React.ComponentType<{ size?: number; className?: string }>;

type Stat = {
    /** short text shown inside the circle */
    short: string;
    /** full title shown in the detail card */
    label: string;
    description: string;
    /** undefined = not verified yet, shows "—" */
    value?: number;
    suffix?: string;
    /** false = show the number straight away instead of counting up */
    countUp?: boolean;
    /** false = no thousands separator (use for years) */
    group?: boolean;
    icon: StatIcon;
};

const fmt = (n: number, group = true) =>
    new Intl.NumberFormat("en-IN", { useGrouping: group }).format(n);

function CountUp({
    value,
    enabled = true,
    group = true,
}: {
    value: number;
    enabled?: boolean;
    group?: boolean;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.6 });
    const reduce = useReducedMotion();
    // deterministic first render (same on server and client)
    const [display, setDisplay] = useState(enabled ? 0 : value);

    useEffect(() => {
        if (!enabled || reduce) {
            setDisplay(value);
            return;
        }
        if (!inView) return;
        const controls = animate(0, value, {
            duration: 1.8,
            ease: "easeOut",
            onUpdate: (v) => setDisplay(Math.round(v)),
        });
        return () => controls.stop();
    }, [inView, value, enabled, reduce]);

    return <span ref={ref}>{fmt(display, group)}</span>;
}

function OrbitNode({
    stat,
    index,
    total,
    angle,
    active,
    pinned,
    onHover,
    onLeave,
    onSelect,
}: {
    stat: Stat;
    index: number;
    total: number;
    angle: MotionValue<number>;
    active: boolean;
    pinned: boolean;
    onHover: () => void;
    onLeave: () => void;
    onSelect: () => void;
}) {
    // evenly spaced around the circle, first one starts at the top
    const offset = (360 / total) * index - 90;
    const left = useTransform(
        angle,
        (a) => `${50 + ORBIT_RADIUS * Math.cos(((a + offset) * Math.PI) / 180)}%`,
    );
    const top = useTransform(
        angle,
        (a) => `${50 + ORBIT_RADIUS * Math.sin(((a + offset) * Math.PI) / 180)}%`,
    );

    return (
        <motion.div
            style={{ left, top }}
            className={cn(
                "absolute z-20 -translate-x-1/2 -translate-y-1/2",
                active && "z-30",
            )}
        >
            <motion.button
                type="button"
                aria-pressed={pinned}
                aria-label={`${stat.label}: ${stat.value === undefined ? "not available yet" : fmt(stat.value, stat.group !== false) + (stat.suffix ?? "")
                    }`}
                onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") onHover();
                }}
                onPointerLeave={(e) => {
                    if (e.pointerType === "mouse") onLeave();
                }}
                onFocus={onHover}
                onBlur={onLeave}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                }}
                animate={{ scale: active ? 1.18 : 1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className={cn(
                    "flex size-[5.25rem] cursor-pointer flex-col items-center justify-center rounded-full border text-center backdrop-blur-sm transition-colors duration-300 outline-none focus-visible:ring-4 focus-visible:ring-cta/60 sm:size-28 md:size-32",
                    active
                        ? "border-cta bg-cta text-cta-foreground shadow-[0_0_40px_rgba(242,154,31,0.55)]"
                        : "border-white/25 bg-white/10 text-white hover:bg-white/20",
                )}
            >
                <span className="text-lg font-extrabold leading-none sm:text-2xl">
                    {stat.value === undefined ? (
                        <span className="opacity-60">—</span>
                    ) : (
                        <CountUp
                            value={stat.value}
                            enabled={stat.countUp !== false}
                            group={stat.group !== false}
                        />
                    )}
                    {stat.suffix}
                </span>
                <span className="mt-1 px-1.5 text-[8px] font-semibold uppercase leading-tight tracking-wide sm:text-[10px]">
                    {stat.short}
                </span>
            </motion.button>
        </motion.div>
    );
}

export default function ImpactSection() {
    const reduce = useReducedMotion() ?? false;

    // The current year is read after mount (not during prerender) so it works with
    // Cache Components and never causes a hydration mismatch.
    const [year, setYear] = useState<number | null>(null);
    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    const stats: Stat[] = [
        {
            short: "Established",
            label: "Year Established",
            description: "Our journey of community service began.",
            value: ESTABLISHED,
            countUp: false,
            group: false,
            icon: IconCalendarEvent,
        },
        {
            short: "Years of Service",
            label: "Years of Service",
            description: "Dedicated to building a better community.",
            value: year ? year - ESTABLISHED : 0,
            suffix: "+",
            icon: IconHeartHandshake,
        },
        {
            short: "People Reached",
            label: "People Reached",
            description: "Individuals and families supported through our initiatives.",
            value: VERIFIED.peopleReached,
            icon: IconUsers,
        },
        {
            short: "Initiatives",
            label: "Community Initiatives",
            description: "Programs and activities created to make a difference.",
            value: VERIFIED.initiatives,
            icon: IconSparkles,
        },
        {
            short: "Areas Covered",
            label: "Areas Covered",
            description: "Communities and locations where our work reaches.",
            value: VERIFIED.areasCovered,
            icon: IconMapPin,
        },
        {
            short: "Volunteers",
            label: "Volunteers & Supporters",
            description: "People who contribute their time and effort to our mission.",
            value: VERIFIED.volunteers,
            icon: IconUsersGroup,
        },
    ];

    /* ---------------- orbit motion ---------------- */
    const orbitRef = useRef<HTMLDivElement>(null);
    const inView = useInView(orbitRef, { margin: "-10% 0px" });
    const angle = useMotionValue(0);
    const speedTarget = useMotionValue(1);
    const speed = useSpring(speedTarget, { stiffness: 60, damping: 18 });

    const [hovered, setHovered] = useState<number | null>(null);
    const [pinned, setPinned] = useState<number | null>(null);
    const activeIndex = hovered ?? pinned;
    const current = activeIndex === null ? null : stats[activeIndex];

    // slow down to a stop while a circle is hovered / selected, speed back up after
    useEffect(() => {
        speedTarget.set(activeIndex === null ? 1 : 0);
    }, [activeIndex, speedTarget]);

    useAnimationFrame((_, delta) => {
        if (reduce || !inView) return;
        const s = Math.max(0, speed.get());
        angle.set(angle.get() + (360 / (ORBIT_SECONDS * 1000)) * delta * s);
    });

    return (
        <section
            id="impact"
            className="relative isolate w-full overflow-hidden bg-brand-dark px-6 py-24 text-brand-dark-foreground sm:py-28"
        >
            {/* soft glows */}
            <div
                aria-hidden
                className="pointer-events-none absolute -left-24 top-0 -z-10 size-96 rounded-full bg-primary/30 blur-3xl"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -right-24 bottom-0 -z-10 size-96 rounded-full bg-secondary/30 blur-3xl"
            />

            <div className="mx-auto max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mx-auto max-w-2xl text-center"
                >
                    <span className="inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
                        Impact &amp; Achievements
                    </span>
                    <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                        Our journey so far
                    </h2>
                    <p className="mt-4 text-base text-white/75 sm:text-lg">
                        A snapshot of our commitment to the community.
                    </p>
                </motion.div>

                {/* Orbit */}
                <div
                    ref={orbitRef}
                    onClick={() => setPinned(null)}
                    className="relative mx-auto mt-14 aspect-square w-[min(92vw,42rem)]"
                >
                    {/* rings */}
                    <div
                        aria-hidden
                        className="absolute inset-[10%] rounded-full border-2 border-dashed border-white/25"
                    />
                    <div
                        aria-hidden
                        className="absolute inset-[2%] rounded-full border border-white/10"
                    />
                    <div
                        aria-hidden
                        className="absolute inset-[24%] rounded-full border border-white/10"
                    />

                    {/* glowing halo behind the logo */}
                    <motion.div
                        aria-hidden
                        animate={reduce ? undefined : { scale: [1, 1.15, 1], opacity: [0.55, 1, 0.55] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-1/2 top-1/2 aspect-square w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cta/25 blur-2xl"
                    />

                    {/* logo in the center */}
                    <LogoBadge />

                    {/* revolving stats */}
                    {stats.map((stat, i) => (
                        <OrbitNode
                            key={stat.label}
                            stat={stat}
                            index={i}
                            total={stats.length}
                            angle={angle}
                            active={activeIndex === i}
                            pinned={pinned === i}
                            onHover={() => setHovered(i)}
                            onLeave={() => setHovered(null)}
                            onSelect={() => setPinned((p) => (p === i ? null : i))}
                        />
                    ))}
                </div>

                {/* Detail card */}
                <div className="mx-auto mt-12 min-h-[11rem] max-w-xl" aria-live="polite">
                    <AnimatePresence mode="wait">
                        {current ? (
                            <motion.div
                                key={current.label}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                                className="rounded-3xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur-sm"
                            >
                                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-cta text-cta-foreground">
                                    <current.icon size={26} />
                                </span>
                                <p className="mt-4 text-4xl font-extrabold tracking-tight">
                                    {current.value === undefined
                                        ? "—"
                                        : fmt(current.value, current.group !== false)}
                                    {current.suffix && (
                                        <span className="text-cta">{current.suffix}</span>
                                    )}
                                </p>
                                <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-white/90">
                                    {current.label}
                                </p>
                                <p className="mt-2 text-sm text-white/70">{current.description}</p>
                            </motion.div>
                        ) : (
                            <motion.p
                                key="hint"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="pt-10 text-center text-sm text-white/60"
                            >
                                Hover or tap a circle to see the details
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

function LogoBadge() {
    // if the logo file is missing, show a simple monogram instead of a broken image
    const [failed, setFailed] = useState(false);
    return (
        <div className="absolute left-1/2 top-1/2 z-10 aspect-square w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-[5%] shadow-2xl shadow-black/30 ring-4 ring-white/30">
            <div className="relative h-full w-full">
                {failed ? (
                    <span className="absolute inset-0 flex items-center justify-center text-4xl font-extrabold text-primary">
                        S
                    </span>
                ) : (
                    <Image
                        src={LOGO}
                        alt="Shivam Jan Swasthya Evem Sarwangin Vikash Kendra logo"
                        fill
                        sizes="(min-width: 640px) 220px, 120px"
                        onError={() => setFailed(true)}
                        className="object-contain"
                    />
                )}
            </div>
        </div>
    );
}