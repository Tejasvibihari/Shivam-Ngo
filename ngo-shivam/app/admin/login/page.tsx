import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/features/admin/auth/components/LoginForm";

export const metadata: Metadata = {
    title: "Admin sign in",
    robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Reads the URL query (`?next=`, `?reason=`). That is runtime data, so it lives under <Suspense>: the page shell is prerendered and only this part waits for the request. */
async function LoginContent({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    return <LoginForm next={first(params.next)} reason={first(params.reason)} />;
}

export default function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-brand-light px-4 py-12 sm:px-6">
            <Suspense
                fallback={
                    <p role="status" aria-live="polite" className="text-sm font-semibold text-muted-foreground">
                        Loading...
                    </p>
                }
            >
                <LoginContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}
