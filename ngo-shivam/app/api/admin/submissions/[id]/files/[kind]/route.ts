import { ObjectId } from "mongodb";
import { withAuth } from "@/lib/admin/auth/guard";
import { fail } from "@/lib/admin/auth/request";
import { formSubmissionsCollection } from "@/lib/admin/db/client";
import { downloadFormFile } from "@/lib/forms/storage";
import type { FormFileKind } from "@/lib/forms";

type RouteContext = { params: Promise<{ id: string; kind: string }> };

export const GET = withAuth<RouteContext>(
    async (_request, _auth, context) => {
        const { id, kind: rawKind } = await context.params;
        if (!/^[a-f\d]{24}$/i.test(id)) return fail(404, "not_found", "File not found.");
        if (rawKind !== "photo" && rawKind !== "resume") {
            return fail(404, "not_found", "File not found.");
        }
        const kind: FormFileKind = rawKind;
        const submission = await (await formSubmissionsCollection()).findOne({ _id: new ObjectId(id) });
        const file = submission?.files[kind];
        if (!file) return fail(404, "not_found", "File not found.");

        const stream = await downloadFormFile(file.id);
        const disposition = kind === "photo" ? "inline" : "attachment";
        let ended = false;
        let cancelled = false;
        const body = new ReadableStream<Uint8Array>({
            start(controller) {
                stream.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
                stream.once("end", () => {
                    ended = true;
                    controller.close();
                });
                stream.once("error", (error: Error) => {
                    ended = true;
                    controller.error(error);
                });
                stream.once("close", () => {
                    if (!ended && !cancelled) {
                        ended = true;
                        controller.error(new Error("File stream closed before completion."));
                    }
                });
            },
            cancel(reason) {
                cancelled = true;
                stream.destroy(reason instanceof Error ? reason : undefined);
            },
        });
        return new Response(body, {
            headers: {
                "Cache-Control": "no-store",
                "Content-Disposition": `${disposition}; filename="${file.filename}"`,
                "Content-Length": String(file.size),
                "Content-Type": file.contentType,
                "X-Content-Type-Options": "nosniff",
            },
        });
    },
    { permission: "submissions:read" },
);
