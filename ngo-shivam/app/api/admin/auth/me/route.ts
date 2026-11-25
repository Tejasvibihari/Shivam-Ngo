import { json } from "@/lib/admin/auth/request";
import { withAuth } from "@/lib/admin/auth/guard";

/** GET /api/admin/auth/me : the signed-in user (401 when there is no valid session). */
export const GET = withAuth(async (_request, auth) => json({ ok: true as const, user: auth.user }));
