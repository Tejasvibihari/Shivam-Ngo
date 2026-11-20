"use client";

import { useState } from "react";
import Image from "next/image";
import { IconNews } from "@tabler/icons-react";

/** News photo / cutting with a soft placeholder when the file is missing. */
export default function NewsImage({
    src,
    alt,
    sizes,
    priority = false,
    className = "",
}: {
    src: string;
    alt: string;
    sizes: string;
    priority?: boolean;
    className?: string;
}) {
    const [failed, setFailed] = useState(false);
    return (
        <>
            {failed ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent to-secondary/30 text-primary/50">
                    <IconNews size={48} aria-hidden />
                </div>
            ) : (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes={sizes}
                    priority={priority}
                    onError={() => setFailed(true)}
                    className={className}
                />
            )}
        </>
    );
}
