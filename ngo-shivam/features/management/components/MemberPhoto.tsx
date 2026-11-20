"use client";

import { useState } from "react";
import Image from "next/image";
import type { TeamMember } from "@/lib/team";

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

/** Photo with an initials fallback when the file is missing. Give it a size via className. */
export default function MemberPhoto({
    member,
    sizes,
    priority = false,
    className = "",
}: {
    member: TeamMember;
    sizes: string;
    priority?: boolean;
    className?: string;
}) {
    const [failed, setFailed] = useState(false);
    return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-accent to-secondary/30 ${className}`}>
            {failed ? (
                <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-primary/60">
                    {initials(member.name)}
                </span>
            ) : (
                <Image
                    src={member.photo}
                    alt={`${member.name}, ${member.role}`}
                    fill
                    sizes={sizes}
                    priority={priority}
                    onError={() => setFailed(true)}
                    className="object-cover"
                />
            )}
        </div>
    );
}
