"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    useTransform,
    type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

/* ============================== SETTINGS ============================== */
/** How many photo frames to show (1 - 10). Props override this. */
const VISIBLE_COUNT = 6;
/**
 * Gap between swaps in ms. Every time this elapses, ONE frame (never all)
 * changes its photo. Lower = faster changing.
 */
const SWAP_INTERVAL = 2500;
/** Timing randomness: 0 = perfectly regular, 0.3 = about ±30% random. */
const JITTER = 0.3;
/** Corner roundness of the square frames. */
const FRAME_RADIUS = "rounded-3xl";

/**
 * `src` can be a path from /public, a remote URL (add its host to
 * next.config `images.remotePatterns`), or a static import:
 *   import photo1 from "@/public/hero/1.jpg";  ->  { src: photo1, alt: "..." }
 */
export type HeroImage = { src: string | StaticImageData; alt: string };

const keyOf = (img: HeroImage) =>
    typeof img.src === "string" ? img.src : img.src.src;

/**
 * Pool of photos. Put them in /public/hero/ (1.jpg ... 10.jpg) or edit the paths.
 * Keep MORE photos here than VISIBLE_COUNT so every swap brings in a new one.
 * The GallerySection shows this same pool.
 */
export const IMAGE_POOL: HeroImage[] = [
    { src: "/hero/1.jpg", alt: "Community health camp" },
    { src: "/hero/2.jpg", alt: "Volunteers helping villagers" },
    { src: "/hero/3.jpg", alt: "Children at an awareness programme" },
    { src: "/hero/4.jpg", alt: "Medical check-up" },
    { src: "/hero/5.jpg", alt: "Women self-help group" },
    { src: "/hero/6.jpg", alt: "Health awareness rally" },
    { src: "/hero/7.jpg", alt: "Distribution drive" },
    { src: "/hero/8.jpg", alt: "Volunteers at work" },
    { src: "/hero/9.jpg", alt: "Village outreach" },
    { src: "/hero/10.jpg", alt: "Community gathering" },
];
/* ====================================================================== */

export type Slot = {
    /** position + size (responsive). Every frame is square. */
    className: string;
    /** resting tilt in degrees */
    rotate: number;
    /** parallax strength in px */
    depth: number;
    /** idle float duration in seconds */
    float: number;
};

/**
 * Frame layouts, ordered so any count looks balanced:
 * left, right, left, right ... (the first N slots are used).
 * Some are hidden on small screens (`hidden md:block` etc.).
 */
export const SLOTS: Slot[] = [
    { className: "left-[3%] top-[16%] w-24 md:w-36 lg:w-48", rotate: -8, depth: 30, float: 6 },
    { className: "right-[3%] top-[12%] w-24 md:w-36 lg:w-44", rotate: 9, depth: 34, float: 6.5 },
    { className: "left-[13%] top-[46%] w-20 md:w-28 lg:w-40", rotate: 7, depth: 56, float: 7 },
    { className: "right-[12%] top-[44%] w-20 md:w-28 lg:w-40", rotate: -7, depth: 58, float: 7.5 },
    { className: "left-[3%] top-[70%] hidden md:block md:w-32 lg:w-44", rotate: 11, depth: 38, float: 8 },
    { className: "right-[2%] top-[68%] hidden md:block md:w-32 lg:w-44", rotate: -12, depth: 30, float: 6 },
    { className: "left-[20%] top-[8%] hidden lg:block lg:w-28", rotate: 15, depth: 18, float: 5.5 },
    { className: "right-[20%] top-[8%] hidden lg:block lg:w-28", rotate: -14, depth: 16, float: 5 },
    { className: "left-[18%] top-[72%] hidden xl:block xl:w-32", rotate: -10, depth: 44, float: 6.8 },
    { className: "right-[17%] top-[74%] hidden xl:block xl:w-32", rotate: 12, depth: 42, float: 7.2 },
];

const FRAME_SIZES = "(min-width: 1024px) 200px, (min-width: 768px) 150px, 100px";

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function FloatingFrame({
    slot,
    image,
    index,
    poolIndex,
    mx,
    my,
    reduce,
}: {
    slot: Slot;
    image: HeroImage;
    index: number;
    /** index of `image` in the pool (the gallery reads this to continue the animation) */
    poolIndex: number;
    mx: MotionValue<number>;
    my: MotionValue<number>;
    reduce: boolean;
}) {
    // Outer layer: cursor parallax (moves opposite to the pointer)
    const x = useTransform(mx, (v) => v * -slot.depth);
    const y = useTransform(my, (v) => v * -slot.depth);

    return (
        <motion.div
            data-hero-frame
            data-slot={index}
            data-pool-index={poolIndex}
            style={reduce ? undefined : { x, y }}
            className={cn(
                "group pointer-events-auto absolute z-10 aspect-square opacity-35 hover:z-30 lg:opacity-100",
                slot.className,
            )}
        >
            {/* Inner layer: entrance, idle float, tilt, hover pop */}
            <motion.div
                initial={{ opacity: 0, scale: 0.7, rotate: slot.rotate - 12 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: slot.rotate,
                    y: reduce ? 0 : [0, -12, 0],
                }}
                whileHover={{ scale: 1.12, rotate: 0 }}
                transition={{
                    default: {
                        type: "spring",
                        stiffness: 120,
                        damping: 14,
                        delay: 0.1 * index,
                    },
                    y: { duration: slot.float, repeat: Infinity, ease: "easeInOut" },
                }}
                className={cn(
                    "absolute inset-0 overflow-hidden bg-gradient-to-br from-accent to-secondary/30 shadow-xl ring-4 ring-background transition-shadow duration-300 group-hover:shadow-2xl group-hover:shadow-primary/30",
                    FRAME_RADIUS,
                )}
            >
                {/* Cross-fade whenever this frame's photo changes */}
                <AnimatePresence initial={false}>
                    <motion.div
                        key={keyOf(image)}
                        initial={{ opacity: 0, scale: 1.15 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            sizes={FRAME_SIZES}
                            // if a file is missing, hide the broken icon and show the gradient
                            onError={(e) => {
                                e.currentTarget.style.visibility = "hidden";
                            }}
                            className="object-cover saturate-[.85] transition duration-500 group-hover:scale-110 group-hover:saturate-110"
                        />
                    </motion.div>
                </AnimatePresence>
                {/* soft brand tint that fades away on hover */}
                <div className="pointer-events-none absolute inset-0 bg-primary/15 transition-opacity duration-500 group-hover:opacity-0" />
            </motion.div>
        </motion.div>
    );
}

type HeroSectionProps = {
    /** photo pool (use more photos than `visibleCount`). Pass the same list to GallerySection. */
    images?: HeroImage[];
    /** number of frames shown (1 - 10) */
    visibleCount?: number;
    /** ms between swaps; one frame changes each time */
    swapInterval?: number;
    /** 0 - 1 timing randomness */
    jitter?: number;
};

export default function HeroSection({
    images = IMAGE_POOL,
    visibleCount = VISIBLE_COUNT,
    swapInterval = SWAP_INTERVAL,
    jitter = JITTER,
}: HeroSectionProps) {
    const reduce = useReducedMotion() ?? false;

    const slotCount = images.length
        ? Math.max(0, Math.min(visibleCount, SLOTS.length))
        : 0;

    /* ---------------- one-at-a-time image swapping ---------------- */
    // assigned[slot] = index into `images` currently shown in that frame.
    // Initial value is deterministic (no randomness) so SSR and client match.
    const [assigned, setAssigned] = useState<number[]>(() =>
        Array.from({ length: slotCount }, (_, i) => i % Math.max(images.length, 1)),
    );
    const assignedRef = useRef<number[]>(assigned);

    useEffect(() => {
        const total = images.length;
        const init = Array.from({ length: slotCount }, (_, i) => i % Math.max(total, 1));
        assignedRef.current = init;
        setAssigned(init);

        if (total <= 1 || slotCount === 0) return;

        let cancelled = false;
        let timer: ReturnType<typeof setTimeout>;
        let bag: number[] = [];
        let last = -1;

        // Every frame gets a turn before any frame repeats, in random order
        const nextSlot = () => {
            if (bag.length === 0) {
                bag = shuffle(Array.from({ length: slotCount }, (_, i) => i));
                if (slotCount > 1 && bag[bag.length - 1] === last) {
                    [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
                }
            }
            const s = bag.pop() as number;
            last = s;
            return s;
        };

        const swap = (slot: number) => {
            const current = assignedRef.current;
            const all = Array.from({ length: total }, (_, i) => i);
            const inUse = new Set(current);
            // prefer a photo that isn't visible anywhere right now
            let choices = all.filter((i) => !inUse.has(i));
            if (choices.length === 0) choices = all.filter((i) => i !== current[slot]);
            if (choices.length === 0) return;
            const next = choices[Math.floor(Math.random() * choices.length)];
            const copy = [...current];
            copy[slot] = next;
            assignedRef.current = copy;
            setAssigned(copy);
        };

        const tick = () => {
            const wait = Math.max(
                600,
                swapInterval * (1 + (Math.random() * 2 - 1) * jitter),
            );
            timer = setTimeout(() => {
                if (cancelled) return;
                // pause swapping while the page is scrolled into the gallery, so the
                // photos the gallery borrowed from the hero are the ones that come back
                if (window.scrollY <= 24) swap(nextSlot());
                tick();
            }, wait);
        };
        tick();

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [images.length, slotCount, swapInterval, jitter]);

    /* ---------------- cursor parallax ---------------- */
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const mx = useSpring(mouseX, { stiffness: 60, damping: 15, mass: 0.4 });
    const my = useSpring(mouseY, { stiffness: 60, damping: 15, mass: 0.4 });

    function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
        const r = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - r.left) / r.width - 0.5);
        mouseY.set((e.clientY - r.top) / r.height - 0.5);
    }

    function handleMouseLeave() {
        mouseX.set(0);
        mouseY.set(0);
    }

    return (
        <section
            id="home"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            // full-screen hero; the fixed navbar floats on top of it.
            // z-10 keeps it above the gallery's background layer.
            className="relative isolate z-10 flex h-svh min-h-[40rem] w-full items-center justify-center overflow-hidden bg-brand-light px-6 pb-16 pt-28"
        >
            {/* Background glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_45%,var(--accent),transparent_70%)]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -left-24 top-1/3 -z-10 size-72 rounded-full bg-primary/15 blur-3xl"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -right-24 bottom-10 -z-10 size-80 rounded-full bg-cta/20 blur-3xl"
            />

            {/* Preload the whole pool so swapped-in photos appear instantly */}
            <div
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 -z-20 h-20 w-20 overflow-hidden opacity-0"
            >
                {images.map((img) => (
                    <Image
                        key={keyOf(img)}
                        src={img.src}
                        alt=""
                        fill
                        sizes={FRAME_SIZES}
                        loading="eager"
                    />
                ))}
            </div>

            {/* Square, rounded, tilted photo frames.
          --hf is set by the GallerySection (1 -> 0) when it takes the photos over. */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{ opacity: "var(--hf, 1)" }}
            >
                {SLOTS.slice(0, slotCount).map((slot, i) => {
                    const poolIndex = (assigned[i] ?? i) % images.length;
                    return (
                        <FloatingFrame
                            key={i}
                            slot={slot}
                            index={i}
                            poolIndex={poolIndex}
                            image={images[poolIndex]}
                            mx={mx}
                            my={my}
                            reduce={reduce}
                        />
                    );
                })}
            </div>

            {/* Center content */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative z-20 mx-auto flex max-w-2xl flex-col items-center text-center"
            >
                <span className="rounded-full border border-primary/30 bg-background/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur">
                    Health &amp; Holistic Development
                </span>

                <h1 className="mt-6 text-4xl font-bold tracking-tight text-brand-dark sm:text-5xl lg:text-6xl">
                    Healthier Lives,{" "}
                    <span className="text-primary">Stronger Communities</span>
                </h1>

                <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                    Shivam Jan Swasthya Evem Sarwangin Vikash Kendra works to bring
                    better health and all-round development to every family in our
                    community.
                </p>

                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                    <Link
                        href="#donate"
                        className="inline-flex items-center justify-center rounded-full bg-cta px-8 py-3.5 text-base font-bold text-cta-foreground shadow-lg shadow-cta/30 transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
                    >
                        Donate Now
                    </Link>
                    <Link
                        href="#volunteer"
                        className="inline-flex items-center justify-center rounded-full border-2 border-primary bg-background/60 px-8 py-3.5 text-base font-bold text-primary backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground"
                    >
                        Be a Volunteer
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}