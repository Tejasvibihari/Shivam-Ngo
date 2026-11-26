import "server-only";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { GridFSBucket, ObjectId, type GridFSBucketWriteStream } from "mongodb";
import { formSubmissionsCollection, getDb } from "@/lib/admin/db/client";
import type { FormFileKind, ParsedForm } from "@/lib/forms";
import type { FormSubmissionDoc, FormSubmissionFile } from "@/lib/admin/db/models";
import { safeUploadFilename, validateFormUpload } from "@/lib/forms/upload-validation";

const UPLOAD_BUCKET = "form_uploads";

export class FormUploadError extends Error {}

async function bucket(): Promise<GridFSBucket> {
    return new GridFSBucket(await getDb(), { bucketName: UPLOAD_BUCKET });
}

async function uploadFile(
    target: GridFSBucket,
    file: File,
    kind: FormFileKind,
): Promise<FormSubmissionFile> {
    const validation = await validateFormUpload(file, kind);
    if (!validation.ok) throw new FormUploadError(validation.error);

    const id = new ObjectId();
    const filename = safeUploadFilename(file.name);
    const stream: GridFSBucketWriteStream = target.openUploadStreamWithId(id, filename, {
        metadata: { kind, contentType: validation.contentType },
    });
    try {
        await pipeline(Readable.from([Buffer.from(await file.arrayBuffer())]), stream);
    } catch (error) {
        await target.delete(id).catch((cleanupError: unknown) => {
            console.error("[forms] Could not clean up an incomplete upload:", cleanupError);
        });
        throw error;
    }
    return { id, filename, contentType: validation.contentType, size: file.size };
}

export async function saveFormSubmission(
    form: ParsedForm,
    uploads: Partial<Record<FormFileKind, File>>,
): Promise<ObjectId> {
    const target = await bucket();
    const files: Partial<Record<FormFileKind, FormSubmissionFile>> = {};
    const uploadedIds: ObjectId[] = [];

    try {
        for (const kind of ["photo", "resume"] as const) {
            const file = uploads[kind];
            if (!file) continue;
            const stored = await uploadFile(target, file, kind);
            files[kind] = stored;
            uploadedIds.push(stored.id);
        }

        const document: FormSubmissionDoc = {
            _id: new ObjectId(),
            type: form.type,
            source: form.source,
            values: form.values,
            files,
            createdAt: new Date(),
        };
        const result = await (await formSubmissionsCollection()).insertOne(document);
        return result.insertedId;
    } catch (error) {
        await Promise.all(
            uploadedIds.map((id) =>
                target.delete(id).catch((cleanupError: unknown) => {
                    console.error("[forms] Could not clean up an incomplete upload:", cleanupError);
                }),
            ),
        );
        throw error;
    }
}

export async function downloadFormFile(id: ObjectId) {
    const target = await bucket();
    return target.openDownloadStream(id);
}
