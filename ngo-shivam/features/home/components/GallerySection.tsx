"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMotionValueEvent, useScroll } from "motion/react";
import { IMAGE_POOL, SLOTS, type HeroImage } from "./HeroSection";

/* ============================== SETTINGS ============================== */
/** Space between gallery photos (px). */
const GAP = 24;
/** Scroll used for the hero -> gallery fly-in, as a multiple of the screen height. */
const PHASE_A = 0.9;
/** Extra pause (x screen height) with everything in place before the page moves on. */
const TAIL = 0.25;
/** Scroll distance (px) over which the hero's photos hand over to the flying copies. */
const HANDOFF_PX = 24;
/** Must match the hero frames' corner radius (rounded-3xl = 24px). */
const RADIUS_PX = 24;
/** id of the hero <section>. */
const HERO_ID = "home";
/* ====================================================================== */

type Cell = { cx: number; cy: number; rotate: number };
type Layout = {
    W: number;
    H: number;
    /** photo size (px) */
    c: number;
    cells: Cell[];
    /** how far the grid scrolls up during the vertical-scroll phase */
    gridScroll: number;
    /** scroll length of the fly-in phase */
    A: number;
    /** total pinned scroll length */
    L: number;
};
type Start = { cx: number; cy: number; size: number; rotate: number };
type Plan = { starts: Map<number, Start>; cellOf: number[] };

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function computeLayout(W: number, H: number, n: number): Layout {
    const cols = W < 640 ? 2 : 3;
    const pad = W < 640 ? 16 : 48;
    const y0 = Math.max(190, H * 0.22); // space for the heading
    const maxC = (W - pad * 2 - GAP * (cols - 1)) / cols;
    const fitC = (H - y0 - 48 - GAP) / 2; // so two rows fit on screen
    const c = Math.max(120, Math.min(340, maxC, fitC));
    const gridW = cols * c + GAP * (cols - 1);
    const left0 = (W - gridW) / 2;
    const stagger = [0, 0.35 * c, 0.12 * c];

    const cells: Cell[] = [];
    for (let i = 0; i < n; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = left0 + col * (c + GAP);
        const y = y0 + row * (c + GAP) + stagger[col];
        cells.push({ cx: x + c / 2, cy: y + c / 2, rotate: ((i * 37) % 7 - 3) * 0.9 });
    }

    const bottom = cells.reduce((m, cell) => Math.max(m, cell.cy + c / 2), 0);
    const gridScroll = Math.max(0, bottom - H + 96);
    const A = H * PHASE_A;
    return { W, H, c, cells, gridScroll, A, L: A + gridScroll + H * TAIL };
}

export default function GallerySection({
    images = IMAGE_POOL,
}: {
    /** must be the same list you give HeroSection */
    images?: HeroImage[];
}) {
    const wrapperRef = useRef<HTMLElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const layoutRef = useRef<Layout | null>(null);
    const planRef = useRef<Plan | null>(null);
    const wrapTopRef = useRef(0);
    const [dims, setDims] = useState<{ height: number; anchor: number } | null>(null);

    const { scrollY } = useScroll();

    /** Every frame of the scroll: place all photos for the current scroll position. */
    const apply = useCallback(
        (scroll: number) => {
            const lay = layoutRef.current;
            if (!lay) return;
            const s = Math.max(0, scroll - wrapTopRef.current);

            // Remember where the hero photos are (only while the hero is on screen)
            if (!planRef.current || s <= HANDOFF_PX) {
                const frames = Array.from(
                    document.querySelectorAll<HTMLElement>("[data-hero-frame]"),
                )
                    .filter((el) => el.offsetWidth > 0)
                    .sort((a, b) => Number(a.dataset.slot) - Number(b.dataset.slot));

                const starts = new Map<number, Start>();
                const order: number[] = [];
                for (const el of frames) {
                    const k = Number(el.dataset.poolIndex);
                    if (Number.isNaN(k) || k >= images.length || starts.has(k)) continue;
                    const r = ((el.firstElementChild as HTMLElement | null) ?? el).getBoundingClientRect();
                    starts.set(k, {
                        cx: r.left + r.width / 2,
                        cy: r.top + s + r.height / 2, // position as it was at scroll 0
                        size: el.offsetWidth,
                        rotate: SLOTS[Number(el.dataset.slot)]?.rotate ?? 0,
                    });
                    order.push(k);
                }
                // hero photos take the first grid cells, the rest follow in order
                const seq = [...order, ...images.map((_, k) => k).filter((k) => !starts.has(k))];
                const cellOf: number[] = [];
                seq.forEach((k, n) => {
                    cellOf[k] = n;
                });
                planRef.current = { starts, cellOf };
            }
            const plan = planRef.current;
            if (!plan) return;

            const hand = clamp(s / HANDOFF_PX); // hero photos -> flying copies
            const w = easeInOutCubic(clamp(s / lay.A)); // fly-in progress
            const offset = clamp(s - lay.A, 0, lay.gridScroll); // vertical scroll phase
            const heroOp = lay.W >= 1024 ? 1 : 0.35; // hero frames are faint on small screens

            document.getElementById(HERO_ID)?.style.setProperty("--hf", String(1 - hand));

            for (let k = 0; k < images.length; k++) {
                const el = itemRefs.current[k];
                if (!el) continue;
                const cell = lay.cells[plan.cellOf[k]];
                if (!cell) {
                    el.style.opacity = "0";
                    continue;
                }
                const tx = cell.cx;
                const ty = cell.cy - offset;
                const st = plan.starts.get(k);

                let cx: number, cy: number, sc: number, rot: number, op: number;
                if (st) {
                    // a photo that was in the hero: fly from its hero spot into its cell
                    cx = lerp(st.cx, tx, w);
                    cy = lerp(st.cy, ty, w);
                    sc = lerp(st.size / lay.c, 1, w);
                    rot = lerp(st.rotate, cell.rotate, w);
                    op = hand * lerp(heroOp, 1, w);
                } else {
                    // a photo that wasn't in the hero: rises in from below
                    cx = tx;
                    cy = lerp(ty + lay.H * 0.5, ty, w);
                    sc = lerp(0.8, 1, w);
                    rot = lerp(cell.rotate * 3, cell.rotate, w);
                    op = w;
                }

                el.style.transform = `translate3d(${cx - lay.c / 2}px, ${cy - lay.c / 2}px, 0) rotate(${rot}deg) scale(${sc})`;
                el.style.opacity = String(op);
                el.style.borderRadius = `${RADIUS_PX / sc}px`; // keeps the visual corner radius constant
            }

            const h = headingRef.current;
            if (h) {
                const t = clamp((w - 0.55) / 0.45);
                h.style.opacity = String(t);
                h.style.transform = `translateY(${(1 - t) * 16}px)`;
            }
        },
        [images],
    );

    /** Measure the screen, size the pinned scroll area, then redraw. */
    const measure = useCallback(() => {
        const stage = stageRef.current;
        const wrap = wrapperRef.current;
        if (!stage || !wrap || images.length === 0) return;

        const lay = computeLayout(stage.offsetWidth, stage.offsetHeight, images.length);
        layoutRef.current = lay;
        planRef.current = null; // re-read the hero positions
        wrapTopRef.current = wrap.getBoundingClientRect().top + window.scrollY;
        stage.style.setProperty("--cell", `${lay.c}px`);

        const height = Math.round(stage.offsetHeight + lay.L);
        const anchor = Math.round(lay.A);
        setDims((prev) =>
            prev && prev.height === height && prev.anchor === anchor
                ? prev
                : { height, anchor },
        );
        apply(window.scrollY);
    }, [images, apply]);

    useMotionValueEvent(scrollY, "change", apply);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        measure();
        let raf = 0;
        const ro = new ResizeObserver(() => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(measure);
        });
        ro.observe(stage);
        return () => {
            ro.disconnect();
            cancelAnimationFrame(raf);
            document.getElementById(HERO_ID)?.style.removeProperty("--hf");
        };
    }, [measure]);

    if (images.length === 0) return null;

    return (
        <section
            ref={wrapperRef}
            aria-label="Gallery"
            // pulled up over the hero so the photos can travel from one to the other
            className="relative -mt-[max(100svh,40rem)] w-full"
            style={{ height: dims ? dims.height : "400svh" }}
        >
            {/* target of the #gallery link: the point where the gallery is fully formed */}
            <span
                id="gallery"
                aria-hidden
                className="absolute left-0 h-px w-px"
                style={{ top: dims ? dims.anchor : "90svh" }}
            />

            {/* Background: sits under the hero and is revealed as the hero scrolls away */}
            <div
                aria-hidden
                className="sticky top-0 z-0 h-svh min-h-[40rem] w-full overflow-hidden bg-brand-light"
            >
                <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_45%,var(--accent),transparent_70%)]" />
                <div className="absolute -left-24 top-1/3 size-72 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute -right-24 bottom-10 size-80 rounded-full bg-cta/20 blur-3xl" />
            </div>

            {/* Pinned stage above the hero: flying photos + heading */}
            <div
                ref={stageRef}
                className="pointer-events-none sticky top-0 z-20 -mt-[max(100svh,40rem)] h-svh min-h-[40rem] w-full overflow-hidden"
            >
                <div
                    ref={headingRef}
                    className="absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-brand-light via-brand-light/90 to-transparent px-6 pb-10 pt-24 text-center opacity-0"
                >
                    <span className="rounded-full border border-primary/30 bg-background/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur">
                        Gallery
                    </span>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">
                        Moments that <span className="text-primary">make a difference</span>
                    </h2>
                </div>

                {images.map((img, k) => (
                    <div
                        key={k}
                        ref={(el) => {
                            itemRefs.current[k] = el;
                        }}
                        className="absolute left-0 top-0 overflow-hidden bg-gradient-to-br from-accent to-secondary/30 opacity-0 shadow-xl ring-4 ring-background will-change-transform"
                        style={{ width: "var(--cell, 16rem)", height: "var(--cell, 16rem)" }}
                    >
                        <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            sizes="(min-width: 1024px) 340px, 45vw"
                            onError={(e) => {
                                e.currentTarget.style.visibility = "hidden";
                            }}
                            className="object-cover saturate-[.85]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-primary/15" />
                    </div>
                ))}
            </div>
        </section>
    );
}