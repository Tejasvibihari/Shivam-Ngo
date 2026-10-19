"use client";

import { useEffect, useRef } from "react";

export interface LeafCursorProps {
    /** Leaves spawned per 100px of mouse movement. Higher = denser trail. */
    density?: number;
    /** Motion speed multiplier (falling, drifting, spinning). 1 = normal. */
    speed?: number;
    /** Base leaf size in px. Each leaf varies randomly around this. */
    size?: number;
    /** How long a leaf lives, in ms (it fades out over this time). */
    lifetime?: number;
    /** Leaf colours; one is picked at random per leaf. */
    colors?: string[];
    /** Hard cap on leaves alive at once (performance guard). */
    maxLeaves?: number;
    /** Sideways drift. 0 = straight down, higher = more wind. */
    wind?: number;
    /** CSS z-index of the overlay canvas. */
    zIndex?: number;
    /** Also leave a trail under the finger on touch screens (mobile). */
    touch?: boolean;
}

type Leaf = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    vr: number;
    size: number;
    age: number;
    life: number;
    phase: number;
    color: string;
};

const DEFAULT_COLORS = ["#16a34a", "#22c55e", "#4ade80", "#15803d", "#65a30d"];

export default function LeafCursor({
    density = 3,
    speed = 1,
    size = 14,
    lifetime = 1600,
    colors = DEFAULT_COLORS,
    maxLeaves = 120,
    wind = 1,
    zIndex = 9999,
    touch = true,
}: LeafCursorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Keep latest props in a ref so changing them doesn't restart the effect.
    const opts = useRef({ density, speed, size, lifetime, colors, maxLeaves, wind });
    opts.current = { density, speed, size, lifetime, colors, maxLeaves, wind };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Skip for users who prefer reduced motion.
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const leaves: Leaf[] = [];
        let raf = 0;
        let running = false;
        let last = 0;
        let lastX = 0;
        let lastY = 0;
        let hasLast = false;
        let carry = 0; // distance carried over between mouse events

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener("resize", resize);

        const spawn = (x: number, y: number) => {
            const o = opts.current;
            if (leaves.length >= o.maxLeaves) leaves.shift();
            const palette = o.colors.length ? o.colors : DEFAULT_COLORS;
            leaves.push({
                x: x + (Math.random() - 0.5) * 8,
                y: y + (Math.random() - 0.5) * 8,
                vx: (Math.random() - 0.5) * 40 * o.wind,
                vy: 25 + Math.random() * 45,
                rot: Math.random() * Math.PI * 2,
                vr: (Math.random() - 0.5) * 5,
                size: o.size * (0.6 + Math.random() * 0.8),
                age: 0,
                life: o.lifetime * (0.7 + Math.random() * 0.6),
                phase: Math.random() * Math.PI * 2,
                color: palette[Math.floor(Math.random() * palette.length)],
            });
        };

        const drawLeaf = (l: Leaf, alpha: number) => {
            const s = l.size;
            ctx.save();
            ctx.translate(l.x, l.y);
            ctx.rotate(l.rot);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = l.color;
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.quadraticCurveTo(s * 0.9, -s * 0.2, 0, s);
            ctx.quadraticCurveTo(-s * 0.9, -s * 0.2, 0, -s);
            ctx.fill();
            // midrib
            ctx.strokeStyle = "rgba(0,0,0,0.25)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -s * 0.8);
            ctx.lineTo(0, s * 0.8);
            ctx.stroke();
            ctx.restore();
        };

        const tick = (now: number) => {
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            const sp = opts.current.speed;

            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            for (let i = leaves.length - 1; i >= 0; i--) {
                const l = leaves[i];
                l.age += dt * 1000;
                if (l.age >= l.life) {
                    leaves.splice(i, 1);
                    continue;
                }
                l.phase += dt * 4 * sp;
                l.x += (l.vx + Math.sin(l.phase) * 30 * opts.current.wind) * dt * sp;
                l.y += l.vy * dt * sp;
                l.rot += l.vr * dt * sp;
                const t = l.age / l.life;
                drawLeaf(l, t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3);
            }

            if (leaves.length > 0) {
                raf = requestAnimationFrame(tick);
            } else {
                running = false; // idle: stop the loop until the mouse moves again
            }
        };

        const start = () => {
            if (running) return;
            running = true;
            last = performance.now();
            raf = requestAnimationFrame(tick);
        };

        const move = (x: number, y: number) => {
            if (!hasLast) {
                lastX = x;
                lastY = y;
                hasLast = true;
                return;
            }
            const dx = x - lastX;
            const dy = y - lastY;
            const dist = Math.hypot(dx, dy);
            const step = 100 / Math.max(opts.current.density, 0.1);
            carry += dist;
            while (carry >= step) {
                carry -= step;
                const f = dist === 0 ? 0 : 1 - carry / dist;
                spawn(lastX + dx * f, lastY + dy * f);
            }
            lastX = x;
            lastY = y;
            if (leaves.length) start();
        };

        // Mouse / pen
        const onPointerMove = (e: PointerEvent) => {
            if (e.pointerType === "touch") return; // touch handled below
            move(e.clientX, e.clientY);
        };

        // Touch: touchmove keeps firing even while the page is scrolling,
        // unlike pointermove (which is cancelled once the browser starts a scroll).
        const onTouchStart = (e: TouchEvent) => {
            const t = e.touches[0];
            if (!t) return;
            hasLast = true;
            lastX = t.clientX;
            lastY = t.clientY;
            carry = 0;
        };
        const onTouchMove = (e: TouchEvent) => {
            const t = e.touches[0];
            if (t) move(t.clientX, t.clientY);
        };

        const onLeave = () => {
            hasLast = false;
            carry = 0;
        };

        window.addEventListener("pointermove", onPointerMove, { passive: true });
        document.addEventListener("mouseleave", onLeave);
        if (touch) {
            window.addEventListener("touchstart", onTouchStart, { passive: true });
            window.addEventListener("touchmove", onTouchMove, { passive: true });
            window.addEventListener("touchend", onLeave, { passive: true });
            window.addEventListener("touchcancel", onLeave, { passive: true });
        }

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
            window.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("mouseleave", onLeave);
            window.removeEventListener("touchstart", onTouchStart);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onLeave);
            window.removeEventListener("touchcancel", onLeave);
        };
    }, [touch]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                zIndex,
            }}
        />
    );
}