"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconSearch } from "@tabler/icons-react";
import { useAdminData } from "@/features/admin/api/useAdminData";
import { ErrorBlock, LoadingBlock } from "@/features/admin/ui/DataState";
import PageHeading from "@/features/admin/ui/PageHeading";
import { adminCardClass, adminFieldClass, adminSecondaryButtonClass } from "@/features/admin/ui/styles";
import { FORM_FIELDS, FORM_TITLES, type FormFileKind, type FormType } from "@/lib/forms";

type SubmissionFile = { filename: string; contentType: string; size: number };
type Submission = {
    id: string;
    type: FormType;
    source: string;
    values: Record<string, string>;
    files: Partial<Record<FormFileKind, SubmissionFile>>;
    createdAt: string;
};
type SubmissionsResponse = {
    submissions: Submission[];
    total: number;
    page: number;
    pageSize: number;
};

const PAGE_SIZE = 10;
const FORM_TYPES: FormType[] = ["contact", "volunteer", "career", "donation"];
const dateTimeFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

function formatSize(bytes: number): string {
    return bytes < 1024 * 1024
        ? `${Math.max(1, Math.round(bytes / 1024))} KB`
        : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SubmissionFiles({ submission }: { submission: Submission }) {
    const photo = submission.files.photo;
    const resume = submission.files.resume;
    if (!photo && !resume) return null;

    return (
        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-4">
            {photo && (
                <a
                    href={`/api/admin/submissions/${submission.id}/files/photo`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm font-semibold text-primary hover:underline"
                >
                    <Image
                        src={`/api/admin/submissions/${submission.id}/files/photo`}
                        alt={`Photo uploaded by ${submission.values.name || "applicant"}`}
                        width={56}
                        height={56}
                        unoptimized
                        className="size-14 rounded-xl border border-border object-cover"
                    />
                    View photo · {formatSize(photo.size)}
                </a>
            )}
            {resume && (
                <a
                    href={`/api/admin/submissions/${submission.id}/files/resume`}
                    className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                    Download resume · {resume.filename} · {formatSize(resume.size)}
                </a>
            )}
        </div>
    );
}

function SubmissionCard({ submission }: { submission: Submission }) {
    const fields = FORM_FIELDS[submission.type].filter((field) => submission.values[field.key]);
    return (
        <article className="rounded-2xl border border-border p-5">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="font-bold text-brand-dark">
                        {FORM_TITLES[submission.type]}
                        {submission.values.name ? ` · ${submission.values.name}` : ""}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {submission.source} · {dateTimeFormat.format(new Date(submission.createdAt))}
                    </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
                    {submission.type}
                </span>
            </header>

            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {fields.map((field) => (
                    <div key={field.key} className={field.kind === "longtext" ? "sm:col-span-2" : ""}>
                        <dt className="text-xs font-semibold text-muted-foreground">{field.label}</dt>
                        <dd className={`mt-1 text-sm text-foreground ${field.kind === "longtext" ? "whitespace-pre-wrap break-words" : "break-words"}`}>
                            {submission.values[field.key]}
                        </dd>
                    </div>
                ))}
            </dl>
            <SubmissionFiles submission={submission} />
        </article>
    );
}

/** Searchable, paginated list of public website form submissions. */
export default function SubmissionsManagement() {
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [type, setType] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            setQuery(search.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (query) params.set("q", query);
    if (type) params.set("type", type);
    const result = useAdminData<SubmissionsResponse>(`/api/admin/submissions?${params.toString()}`);
    const data = result.data;
    const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <PageHeading
                title="Submissions"
                description="Review contact messages, volunteer applications, career applications and donation enquiries."
            />

            <section className={adminCardClass} aria-label="Form submissions">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div className="relative">
                        <label htmlFor="submission-search" className="sr-only">
                            Search submissions
                        </label>
                        <IconSearch size={18} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            id="submission-search"
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search name, email or phone"
                            maxLength={100}
                            className={`${adminFieldClass} mt-0 pl-11`}
                        />
                    </div>
                    <label>
                        <span className="sr-only">Filter by form type</span>
                        <select
                            value={type}
                            onChange={(event) => {
                                setType(event.target.value);
                                setPage(1);
                            }}
                            className={`${adminFieldClass} mt-0`}
                        >
                            <option value="">All form types</option>
                            {FORM_TYPES.map((formType) => (
                                <option key={formType} value={formType}>
                                    {FORM_TITLES[formType]}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="mt-6 space-y-3" aria-live="polite">
                    {result.state === "loading" && <LoadingBlock label="Loading submissions..." />}
                    {result.state === "error" && <ErrorBlock message={result.error} onRetry={result.reload} />}
                    {data && data.submissions.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            {query || type ? "No submissions match your filters." : "No submissions have been received yet."}
                        </p>
                    )}
                    {data?.submissions.map((submission) => (
                        <SubmissionCard key={submission.id} submission={submission} />
                    ))}
                </div>

                {data && data.total > 0 && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                        <p className="text-xs text-muted-foreground">
                            {data.total} submission{data.total === 1 ? "" : "s"} · page {data.page} of {pages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                                disabled={page <= 1}
                                className={adminSecondaryButtonClass}
                            >
                                <IconChevronLeft size={16} aria-hidden /> Previous
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((current) => current + 1)}
                                disabled={page >= pages}
                                className={adminSecondaryButtonClass}
                            >
                                Next <IconChevronRight size={16} aria-hidden />
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
