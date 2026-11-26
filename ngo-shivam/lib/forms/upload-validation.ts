import type { FormFileKind } from "@/lib/forms";

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_RESUME_BYTES = 10 * 1024 * 1024;

type UploadValidation =
    | { ok: true; contentType: string }
    | { ok: false; error: string };

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
    return signature.every((byte, index) => bytes[index] === byte);
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
    return String.fromCharCode(...bytes.slice(start, end));
}

export async function validateFormUpload(file: File, kind: FormFileKind): Promise<UploadValidation> {
    const maxBytes = kind === "photo" ? MAX_PHOTO_BYTES : MAX_RESUME_BYTES;
    const label = kind === "photo" ? "Photo" : "Resume";
    if (file.size === 0) return { ok: false, error: `${label} file is empty.` };
    if (file.size > maxBytes) {
        return { ok: false, error: `${label} must be ${kind === "photo" ? "5" : "10"} MB or smaller.` };
    }

    const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

    if (kind === "photo") {
        const contentType =
            extension === ".jpg" || extension === ".jpeg"
                ? startsWith(bytes, [0xff, 0xd8, 0xff])
                    ? "image/jpeg"
                    : null
                : extension === ".png"
                  ? startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
                      ? "image/png"
                      : null
                  : extension === ".webp"
                    ? ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP"
                        ? "image/webp"
                        : null
                    : null;
        if (contentType) return { ok: true, contentType };
        return {
            ok: false,
            error: "Upload a JPG, PNG, or WebP image with a matching file extension.",
        };
    }

    const contentType =
        extension === ".pdf"
            ? ascii(bytes, 0, 5) === "%PDF-"
                ? "application/pdf"
                : null
            : extension === ".doc"
              ? startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
                  ? "application/msword"
                  : null
              : extension === ".docx"
                ? startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])
                    ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    : null
                : null;
    if (contentType) return { ok: true, contentType };
    return {
        ok: false,
        error: "Upload a PDF, DOC, or DOCX resume with a matching file extension.",
    };
}

export async function validateCareerUploads(
    uploads: Partial<Record<FormFileKind, File>>,
): Promise<{ ok: true } | { ok: false; error: string }> {
    for (const kind of ["photo", "resume"] as const) {
        const file = uploads[kind];
        if (!file) return { ok: false, error: `Please attach your ${kind}.` };
        const result = await validateFormUpload(file, kind);
        if (!result.ok) return result;
    }
    return { ok: true };
}

export function safeUploadFilename(name: string): string {
    const baseName = name.split(/[\\/]/).pop() ?? "upload";
    const safeName = baseName
        .normalize("NFKC")
        .replace(/[^a-zA-Z0-9._ -]/g, "_")
        .replace(/[\s.]+$/g, "")
        .slice(0, 160);
    return safeName || "upload";
}
