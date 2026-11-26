import type { Filter } from "mongodb";
import { withAuth } from "@/lib/admin/auth/guard";
import { fail, json } from "@/lib/admin/auth/request";
import { formSubmissionsCollection } from "@/lib/admin/db/client";
import type { FormSubmissionDoc } from "@/lib/admin/db/models";
import { isFormType, type FormFileKind } from "@/lib/forms";

const MAX_PAGE_SIZE = 50;
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function intParam(value: string | null, fallback: number, min: number, max: number): number {
    if (value === null || value.trim() === "") return fallback;
    const n = Number(value);
    return Number.isInteger(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

export const GET = withAuth(
    async (request) => {
        const params = request.nextUrl.searchParams;
        const page = intParam(params.get("page"), 1, 1, 100_000);
        const pageSize = intParam(params.get("pageSize"), 20, 1, MAX_PAGE_SIZE);
        const filter: Filter<FormSubmissionDoc> = {};

        const type = params.get("type");
        if (type) {
            if (!isFormType(type)) return fail(400, "validation_error", "Unknown submission type.");
            filter.type = type;
        }

        const query = (params.get("q") ?? "").trim().slice(0, 100);
        if (query) {
            const rx = new RegExp(escapeRegex(query), "i");
            filter.$or = [
                { "values.name": rx },
                { "values.email": rx },
                { "values.phone": rx },
                { "values.position": rx },
                { "values.interest": rx },
                { "values.subject": rx },
            ];
        }

        const submissions = await formSubmissionsCollection();
        const [total, docs] = await Promise.all([
            submissions.countDocuments(filter),
            submissions
                .find(filter)
                .sort({ createdAt: -1, _id: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .toArray(),
        ]);

        return json({
            ok: true as const,
            submissions: docs.map((submission) => ({
                id: submission._id.toHexString(),
                type: submission.type,
                source: submission.source,
                values: submission.values,
                files: Object.fromEntries(
                    (["photo", "resume"] as const)
                        .filter((kind: FormFileKind) => submission.files[kind])
                        .map((kind) => {
                            const file = submission.files[kind]!;
                            return [kind, { filename: file.filename, contentType: file.contentType, size: file.size }];
                        }),
                ),
                createdAt: submission.createdAt.toISOString(),
            })),
            total,
            page,
            pageSize,
        });
    },
    { permission: "submissions:read" },
);
