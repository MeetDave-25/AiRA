import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { v4 as uuidv4 } from "uuid";

type DirectUploadPayload = {
    url: string;
    path?: string;
    mediaType?: string;
    caption?: string | null;
};

async function insertEventMedia(eventId: string, uploads: DirectUploadPayload[], isPrimary: boolean) {
    if (!uploads.length) {
        return NextResponse.json({ error: "No media provided" }, { status: 400 });
    }

    if (isPrimary) {
        await db.from("EventImage").update({ isPrimary: false }).eq("eventId", eventId);
    }

    const rows = uploads.map((upload, index) => ({
        id: uuidv4(),
        eventId,
        url: upload.url,
        caption: upload.caption || null,
        isPrimary: index === 0 && isPrimary,
    }));

    const { data, error } = await db.from("EventImage").insert(rows).select();

    if (error) {
        console.error("Event media insert error:", error);
        throw new Error(error.message || "Failed to save media");
    }

    return NextResponse.json(data || [], { status: 201 });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const supabase = createSupabaseAdmin();
    const { data: images, error } = await supabase
        .from("EventImage")
        .select("*")
        .eq("eventId", params.id)
        .order("isPrimary", { ascending: false })
        .order("createdAt", { ascending: true });

    if (error) {
        console.error("Get images error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch images" }, { status: 500 });
    }
    return NextResponse.json(images || []);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const body = await req.json();
            const uploads = Array.isArray(body.files) ? body.files : [];
            const isPrimary = body.isPrimary === true || body.isPrimary === "true";
            return await insertEventMedia(params.id, uploads, isPrimary);
        }

        const supabase = createSupabaseAdmin();
        const formData = await req.formData();
        const files = formData.getAll("images") as File[];
        const isPrimary = formData.get("isPrimary") === "true";

        if (!files.length) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        const uploads: DirectUploadPayload[] = [];
        for (const file of files) {
            const ext = file.name.split(".").pop();
            const filename = `${uuidv4()}.${ext}`;
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const { error: storageError } = await supabase.storage
                .from("events")
                .upload(filename, buffer, {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type,
                });

            if (storageError) {
                console.error("Supabase Storage Error:", storageError);
                throw new Error(storageError.message || "Storage upload failed");
            }

            const { data: publicUrlData } = supabase.storage.from("events").getPublicUrl(filename);
            uploads.push({
                url: publicUrlData.publicUrl,
                path: filename,
                mediaType: file.type,
            });
        }

        return await insertEventMedia(params.id, uploads, isPrimary);
    } catch (error: any) {
        console.error("Media upload error:", error);
        return NextResponse.json({ error: error?.message || "Media upload failed" }, { status: 500 });
    }
}
