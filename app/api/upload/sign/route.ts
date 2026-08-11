import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_BUCKETS = new Set(["uploads", "events"]);
const ALLOWED_MIME_PREFIXES = ["image/", "video/"];
const ALLOWED_EXACT_MIME_TYPES = new Set(["application/pdf"]);

function sanitizeSegment(input: string) {
    return input.replace(/[^a-zA-Z0-9/_-]/g, "-").replace(/\/+/g, "/").replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const bucket = typeof body.bucket === "string" && ALLOWED_BUCKETS.has(body.bucket) ? body.bucket : "uploads";
        const folder = typeof body.folder === "string" ? sanitizeSegment(body.folder) : "general";
        const filename = typeof body.filename === "string" ? body.filename : "";
        const contentType = typeof body.contentType === "string" ? body.contentType : "";

        // Check authentication: allow public for application photos, require login for members
        const isPublicAllowed = folder.startsWith("applications") || folder.startsWith("applicant");
        if (!isPublicAllowed) {
            const session = await getServerSession(authOptions);
            if (!session?.user) {
                return NextResponse.json({ error: "Unauthorized: Please log in to upload" }, { status: 401 });
            }
        }

        if (!filename) {
            return NextResponse.json({ error: "Filename is required" }, { status: 400 });
        }

        const isAllowedType =
            ALLOWED_MIME_PREFIXES.some((prefix) => contentType.startsWith(prefix)) ||
            ALLOWED_EXACT_MIME_TYPES.has(contentType);

        if (!isAllowedType) {
            return NextResponse.json({ error: "Only image, video, or PDF uploads are allowed" }, { status: 400 });
        }

        const ext = filename.includes(".") ? filename.split(".").pop() : "";
        const safeExt = ext ? `.${ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}` : "";
        const path = `${folder}/${uuidv4()}${safeExt}`;

        const supabase = createSupabaseAdmin();
        const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);

        if (error || !data) {
            throw new Error(error?.message || "Failed to create signed upload");
        }

        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);

        return NextResponse.json({
            bucket,
            path,
            token: data.token,
            publicUrl: publicUrlData.publicUrl,
        });
    } catch (error: any) {
        console.error("Signed upload error:", error);
        return NextResponse.json({ error: error?.message || "Could not prepare upload" }, { status: 500 });
    }
}
