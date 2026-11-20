import { IconAlertCircle, IconCircleCheck } from "@tabler/icons-react";
import type { SubmitStatus } from "@/lib/use-form-submit";

/** Hidden field that only bots fill in. Must sit inside the <form>. */
export function HoneypotField() {
    return (
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
                Website
                <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </label>
        </div>
    );
}

/** Success / error message shown under the submit button. */
export default function FormStatus({
    status,
    error,
    successMessage,
}: {
    status: SubmitStatus;
    error: string;
    successMessage: string;
}) {
    if (status === "success") {
        return (
            <p
                role="status"
                className="mt-4 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
            >
                <IconCircleCheck size={20} aria-hidden className="mt-0.5 shrink-0" />
                {successMessage}
            </p>
        );
    }
    if (status === "error") {
        return (
            <p
                role="alert"
                className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
            >
                <IconAlertCircle size={20} aria-hidden className="mt-0.5 shrink-0" />
                {error}
            </p>
        );
    }
    return null;
}
