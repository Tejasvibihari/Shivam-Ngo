"use client";

import { useEffect, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconSearch } from "@tabler/icons-react";
import { roleLabel } from "@/features/admin/access/policy";
import { useAdminData } from "@/features/admin/api/useAdminData";
import type { AuthUser } from "@/features/admin/auth/types";
import { ErrorBlock, LoadingBlock } from "@/features/admin/ui/DataState";
import PageHeading from "@/features/admin/ui/PageHeading";
import { adminCardClass, adminFieldClass, adminSecondaryButtonClass } from "@/features/admin/ui/styles";
import { ROLES, USER_STATUSES } from "@/lib/admin/db/models";

type UsersResponse = { users: AuthUser[]; total: number; page: number; pageSize: number };

const PAGE_SIZE = 10;
const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
const dateTimeFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });
const formatDate = (iso: string | null, withTime = false) =>
    iso ? (withTime ? dateTimeFormat : dateFormat).format(new Date(iso)) : "Never";

function StatusBadge({ status }: { status: AuthUser["status"] }) {
    const active = status === "active";
    return (
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${active ? "bg-primary/15 text-primary" : "bg-destructive/10 text-destructive"}`}>
            {active ? "Active" : "Disabled"}
        </span>
    );
}

const RoleBadge = ({ role }: { role: AuthUser["role"] }) => (
    <span className="inline-block rounded-full bg-brand-dark/10 px-3 py-1 text-xs font-bold text-brand-dark">{roleLabel(role)}</span>
);

/** Read-only list of admin accounts from GET /api/admin/users, with search, filters and paging. */
export default function UsersManagement() {
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);

    // wait until the person stops typing before asking the server
    useEffect(() => {
        const timer = setTimeout(() => {
            setQuery(search.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (query) params.set("q", query);
    if (role) params.set("role", role);
    if (status) params.set("status", status);
    const result = useAdminData<UsersResponse>(`/api/admin/users?${params.toString()}`);

    const data = result.data;
    const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6">
            <PageHeading title="Users" description="Admin accounts and their roles. Accounts are created through the signup page with the signup PIN." />

            <section className={adminCardClass} aria-label="User list">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                    <div className="relative">
                        <label htmlFor="user-search" className="sr-only">
                            Search by name or email
                        </label>
                        <IconSearch size={18} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            id="user-search"
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email"
                            maxLength={100}
                            className={`${adminFieldClass} mt-0 pl-11`}
                        />
                    </div>
                    <div>
                        <label htmlFor="user-role" className="sr-only">
                            Filter by role
                        </label>
                        <select
                            id="user-role"
                            value={role}
                            onChange={(e) => {
                                setRole(e.target.value);
                                setPage(1);
                            }}
                            className={`${adminFieldClass} mt-0`}
                        >
                            <option value="">All roles</option>
                            {ROLES.map((r) => (
                                <option key={r} value={r}>
                                    {roleLabel(r)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="user-status" className="sr-only">
                            Filter by status
                        </label>
                        <select
                            id="user-status"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                            className={`${adminFieldClass} mt-0`}
                        >
                            <option value="">All statuses</option>
                            {USER_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s === "active" ? "Active" : "Disabled"}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6" aria-live="polite">
                    {result.state === "loading" && <LoadingBlock label="Loading users..." />}
                    {result.state === "error" && <ErrorBlock message={result.error} onRetry={result.reload} />}
                    {data && data.users.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            {query || role || status ? "No users match your filters." : "There are no users yet."}
                        </p>
                    )}

                    {data && data.users.length > 0 && (
                        <>
                            {/* Small screens: one card per user */}
                            <ul className="space-y-3 md:hidden">
                                {data.users.map((u) => (
                                    <li key={u.id} className="rounded-2xl border border-border p-4">
                                        <p className="truncate text-sm font-bold text-foreground">{u.name}</p>
                                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <RoleBadge role={u.role} />
                                            <StatusBadge status={u.status} />
                                        </div>
                                        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <dt className="text-muted-foreground">Last sign-in</dt>
                                                <dd className="font-semibold text-foreground">{formatDate(u.lastLoginAt, true)}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-muted-foreground">Created</dt>
                                                <dd className="font-semibold text-foreground">{formatDate(u.createdAt)}</dd>
                                            </div>
                                        </dl>
                                    </li>
                                ))}
                            </ul>

                            {/* Medium screens and up: table (scrolls inside its own box if it ever overflows) */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-176 text-left text-sm">
                                    <caption className="sr-only">Admin accounts</caption>
                                    <thead>
                                        <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                                            <th scope="col" className="py-3 pr-4 font-semibold">Name</th>
                                            <th scope="col" className="py-3 pr-4 font-semibold">Role</th>
                                            <th scope="col" className="py-3 pr-4 font-semibold">Status</th>
                                            <th scope="col" className="py-3 pr-4 font-semibold">Last sign-in</th>
                                            <th scope="col" className="py-3 font-semibold">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.users.map((u) => (
                                            <tr key={u.id} className="border-b border-border/60 last:border-0">
                                                <td className="max-w-64 py-3 pr-4">
                                                    <p className="truncate font-semibold text-foreground">{u.name}</p>
                                                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                                                </td>
                                                <td className="py-3 pr-4"><RoleBadge role={u.role} /></td>
                                                <td className="py-3 pr-4"><StatusBadge status={u.status} /></td>
                                                <td className="py-3 pr-4 text-muted-foreground">{formatDate(u.lastLoginAt, true)}</td>
                                                <td className="py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                <p className="text-xs text-muted-foreground">
                                    {data.total} user{data.total === 1 ? "" : "s"} · page {data.page} of {pages}
                                </p>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className={adminSecondaryButtonClass}>
                                        <IconChevronLeft size={16} aria-hidden /> Previous
                                    </button>
                                    <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= pages} className={adminSecondaryButtonClass}>
                                        Next <IconChevronRight size={16} aria-hidden />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
