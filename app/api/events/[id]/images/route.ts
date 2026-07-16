import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-guard";
import { v4 as uuidv4 } from "uuid";

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

    const supabase = createSupabaseAdmin();

    try {
        const formData = await req.formData();
        const files = formData.getAll("images") as File[];
        const isPrimary = formData.get("isPrimary") === "true";

        if (!files.length) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        const savedImages = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split(".").pop();
            const filename = `${uuidv4()}.${ext}`;

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Upload to Supabase Storage using admin client directly
            const { error: storageError } = await supabase.storage
                .from("events")
                .upload(filename, buffer, {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type
                });

            if (storageError) {
                console.error("Supabase Storage Error:", storageError);
                throw new Error(storageError.message || "Storage upload failed");
            }

            const { data: publicUrlData } = supabase.storage.from("events").getPublicUrl(filename);
            const publicUrl = publicUrlData.publicUrl;

            const { data: image, error: dbError } = await supabase
                .from("EventImage")
                .insert({ id: uuidv4(), eventId: params.id, url: publicUrl, isPrimary: i === 0 && isPrimary })
                .select()
                .single();

            if (dbError) {
                console.error("EventImage insert error:", dbError);
                throw new Error(dbError.message || "Failed to save image record");
            }
            if (image) savedImages.push(image);
        }

        return NextResponse.json(savedImages, { status: 201 });
    } catch (error: any) {
        console.error("Image upload error:", error);
        return NextResponse.json({ error: error?.message || "Image upload failed" }, { status: 500 });
    }
}
