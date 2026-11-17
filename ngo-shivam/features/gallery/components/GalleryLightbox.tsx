"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import type { GalleryItem } from "@/lib/gallery";

type GalleryLightboxProps = {
    items: GalleryItem[];
    /** index into `items`, or null when closed */
    index: number | null;
    onClose: () => void;
    onIndexChange: (index: number) => void;
};

/** Full-screen photo viewer: Esc closes, ← → navigate, focus is moved in and restored on close. */
export default function GalleryLightbox({ items, index, onClose, onIndexChange }: GalleryLightboxProps) {
    const closeRef = useRef<HTMLButtonElement>(null);
    const open = index !== null && items[index] !== undefined;

    useEffect(() => {
        if (!open) return;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        return () => {
            document.body.style.overflow = overflow;
            previouslyFocused?.focus?.();
        };
    }, [open]);

    useEffect(() => {
        if (index === null) return;
        const last = items.length - 1;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowRight") onIndexChange(index >= last ? 0 : index + 1);
            else if (e.key === "ArrowLeft") onIndexChange(index <= 0 ? last : index - 1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [index, items.length, onClose, onIndexChange]);

    const item = index !== null ? items[index] : undefined;
    const last = items.length - 1;

    return (
        <AnimatePresence>
            {open && item && index !== null && (
                <motion.div
                    key="lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Photo ${index + 1} of ${items.length}: ${item.caption}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex flex-col bg-brand-dark/95 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
                        <p className="text-sm font-medium tabular-nums">
                            {index + 1} / {items.length}
                        </p>
                        <button
                            ref={closeRef}
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="rounded-full bg-white/10 p-2 transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
                        >
                            <IconX size={22} aria-hidden />
                        </button>
                    </div>

                    <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
                        <button
                            type="button"
                            aria-label="Previous photo"
                            onClick={(e) => {
                                e.stopPropagation();
                                onIndexChange(index <= 0 ? last : index - 1);
                            }}
                            className="absolute left-2 z-10 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:left-6"
                        >
                            <IconChevronLeft size={26} aria-hidden />
                        </button>

                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25 }}
                            className="relative h-full w-full max-w-5xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={item.src}
                                alt={item.alt}
                                fill
                                sizes="(min-width: 1024px) 1024px, 100vw"
                                className="object-contain"
                                priority
                            />
                        </motion.div>

                        <button
                            type="button"
                            aria-label="Next photo"
                            onClick={(e) => {
                                e.stopPropagation();
                                onIndexChange(index >= last ? 0 : index + 1);
                            }}
                            className="absolute right-2 z-10 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:right-6"
                        >
                            <IconChevronRight size={26} aria-hidden />
                        </button>
                    </div>

                    <p className="px-6 py-4 text-center text-sm text-white/90 sm:text-base" onClick={(e) => e.stopPropagation()}>
                        {item.caption}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
