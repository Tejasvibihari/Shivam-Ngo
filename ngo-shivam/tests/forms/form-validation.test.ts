import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseForm, subjectFor } from "@/lib/forms";
import { MAX_PHOTO_BYTES, validateCareerUploads, validateFormUpload } from "@/lib/forms/upload-validation";

const file = (name: string, signature: number[]) =>
    new File([Uint8Array.from(signature)], name);

describe("public form parsing", () => {
    it("accepts donation enquiries with an optional valid amount", () => {
        const parsed = parseForm({
            type: "donation",
            source: "Home page",
            data: { name: "Asha", phone: "+91 9876543210", amount: "250.50" },
        });
        assert.equal(parsed.ok, true);
        if (parsed.ok) assert.equal(subjectFor(parsed.data), "Donation enquiry: Asha");
    });

    it("rejects malformed or out-of-range donation amounts", () => {
        for (const amount of ["0", "-1", "1e4", "100000000", "12.345"]) {
            const parsed = parseForm({
                type: "donation",
                source: "Home page",
                data: { name: "Asha", phone: "+91 9876543210", amount },
            });
            assert.equal(parsed.ok, false, amount);
        }
    });

    it("no longer accepts a career resume link as a stored field", () => {
        const parsed = parseForm({
            type: "career",
            source: "Career page",
            data: {
                name: "Asha",
                phone: "+91 9876543210",
                email: "asha@example.org",
                position: "Coordinator",
                qualification: "MSW",
                experience: "3 years",
                resumeLink: "https://example.org/cv",
            },
        });
        assert.equal(parsed.ok, true);
        if (parsed.ok) assert.equal("resumeLink" in parsed.data.values, false);
    });
});

describe("career file validation", () => {
    it("requires both a photo and a resume", async () => {
        const missingPhoto = await validateCareerUploads({
            resume: file("resume.pdf", [0x25, 0x50, 0x44, 0x46, 0x2d]),
        });
        assert.deepEqual(missingPhoto, { ok: false, error: "Please attach your photo." });

        const missingResume = await validateCareerUploads({
            photo: file("photo.jpg", [0xff, 0xd8, 0xff]),
        });
        assert.deepEqual(missingResume, { ok: false, error: "Please attach your resume." });

        assert.deepEqual(
            await validateCareerUploads({
                photo: file("photo.jpg", [0xff, 0xd8, 0xff]),
                resume: file("resume.pdf", [0x25, 0x50, 0x44, 0x46, 0x2d]),
            }),
            { ok: true },
        );
    });

    it("accepts supported image signatures and rejects mismatched content", async () => {
        assert.equal((await validateFormUpload(file("photo.jpg", [0xff, 0xd8, 0xff]), "photo")).ok, true);
        assert.equal((await validateFormUpload(file("photo.png", [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "photo")).ok, true);
        assert.equal((await validateFormUpload(file("photo.webp", [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]), "photo")).ok, true);
        assert.equal((await validateFormUpload(file("photo.jpg", [0x89, 0x50, 0x4e, 0x47]), "photo")).ok, false);
    });

    it("accepts PDF, DOC and DOCX signatures and enforces the image size limit", async () => {
        assert.equal((await validateFormUpload(file("resume.pdf", [0x25, 0x50, 0x44, 0x46, 0x2d]), "resume")).ok, true);
        assert.equal((await validateFormUpload(file("resume.doc", [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), "resume")).ok, true);
        assert.equal((await validateFormUpload(file("resume.docx", [0x50, 0x4b, 0x03, 0x04]), "resume")).ok, true);
        const oversized = new File([new Uint8Array(MAX_PHOTO_BYTES + 1)], "photo.jpg");
        const result = await validateFormUpload(oversized, "photo");
        assert.equal(result.ok, false);
        if (!result.ok) assert.match(result.error, /5 MB/);
    });
});
