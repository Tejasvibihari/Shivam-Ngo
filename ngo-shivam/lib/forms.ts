/**
 * Shared definition of every website form that is emailed to the NGO.
 * Used on the server (validation + email layout). Contains no secrets.
 */

export type FormType = "contact" | "volunteer";

type FieldKind = "text" | "phone" | "email" | "longtext";

type FieldDef = {
    key: string;
    label: string;
    kind: FieldKind;
    required?: boolean;
};

export const FORM_FIELDS: Record<FormType, FieldDef[]> = {
    contact: [
        { key: "name", label: "Name", kind: "text", required: true },
        { key: "phone", label: "Phone", kind: "phone", required: true },
        { key: "email", label: "Email", kind: "email" },
        { key: "subject", label: "Subject", kind: "text", required: true },
        { key: "message", label: "Message", kind: "longtext", required: true },
    ],
    volunteer: [
        { key: "name", label: "Name", kind: "text", required: true },
        { key: "phone", label: "Phone", kind: "phone", required: true },
        { key: "email", label: "Email", kind: "email" },
        { key: "city", label: "Area / city", kind: "text" },
        { key: "interest", label: "Interested in", kind: "text", required: true },
        { key: "availability", label: "Availability", kind: "text" },
        { key: "message", label: "Message", kind: "longtext" },
    ],
};

export const FORM_TITLES: Record<FormType, string> = {
    contact: "Contact form",
    volunteer: "Volunteer application",
};

const MAX_LENGTH: Record<FieldKind, number> = {
    text: 200,
    phone: 25,
    email: 254,
    longtext: 5000,
};

export type ParsedForm = {
    type: FormType;
    /** Where on the site it was submitted from, e.g. "Home page". */
    source: string;
    values: Record<string, string>;
};

export type ParseResult =
    | { ok: true; data: ParsedForm }
    | { ok: false; error: string };

/** Remove control characters (keeps \n and \t for long text) and trim. */
function clean(value: unknown, kind: FieldKind): string {
    if (typeof value !== "string") return "";
    let v = value.replace(/\r\n?/g, "\n");
    v = v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
    if (kind !== "longtext") v = v.replace(/[\n\t]+/g, " ");
    return v.trim();
}

export function isFormType(value: unknown): value is FormType {
    return value === "contact" || value === "volunteer";
}

export function parseForm(raw: unknown): ParseResult {
    if (!raw || typeof raw !== "object") {
        return { ok: false, error: "Invalid request." };
    }
    const body = raw as Record<string, unknown>;
    if (!isFormType(body.type)) {
        return { ok: false, error: "Unknown form." };
    }
    const type = body.type;
    const input =
        body.data && typeof body.data === "object"
            ? (body.data as Record<string, unknown>)
            : {};

    const values: Record<string, string> = {};
    for (const field of FORM_FIELDS[type]) {
        const value = clean(input[field.key], field.kind);

        if (field.required && !value) {
            return { ok: false, error: `Please fill in: ${field.label}.` };
        }
        if (value.length > MAX_LENGTH[field.kind]) {
            return { ok: false, error: `${field.label} is too long.` };
        }
        if (value && field.kind === "email" && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)) {
            return { ok: false, error: "Please enter a valid email address." };
        }
        if (value && field.kind === "phone") {
            const digits = value.replace(/\D/g, "");
            if (!/^[+\d\s().-]+$/.test(value) || digits.length < 7 || digits.length > 15) {
                return { ok: false, error: "Please enter a valid phone number." };
            }
        }
        values[field.key] = value;
    }

    const source = clean(body.source, "text").slice(0, 60) || "Website";
    return { ok: true, data: { type, source, values } };
}

/** Email subject line for the NGO inbox. Always a single line. */
export function subjectFor({ type, values }: ParsedForm): string {
    if (type === "contact") {
        return `${values.subject}: message from ${values.name}`;
    }
    return `Volunteer application: ${values.interest} (${values.name})`;
}
