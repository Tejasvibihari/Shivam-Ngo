"use client";

import { useState } from "react";
import Image from "next/image";

/** Photo with a gradient fallback: if the file is missing, the broken-image icon is hidden. */
export default function ActivityImage({
    src,
    alt,
    priority = false,
}: {
    src: string;
    alt: string;
    priority?: boolean;
}) {
    const [failed, setFailed] = useState(false);
    return (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-secondary/30 shadow-xl ring-4 ring-background">
            {!failed && (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    priority={priority}
                    sizes="(min-width: 1024px) 520px, 90vw"
                    onError={() => setFailed(true)}
                    className="object-cover transition duration-700 hover:scale-105"
                />
            )}
        </div>
    );
}
