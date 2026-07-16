import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireAdmin } from "@/lib/admin-guard";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const supabase = createSupabaseAdmin();

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = (formData.get("type") as string) || "general";

        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        const ext = file.name.split(".").pop();
        const filename = `${uuidv4()}.${ext}`;
        const uploadPath = `${type}/${filename}`; // Type defines the subfolder

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { error: storageError } = await supabase.storage
            .from("uploads")
            .upload(uploadPath, buffer, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type,
            });

        if (storageError) {
            console.error("Supabase Storage Error:", storageError);
            throw new Error(storageError.message || "Storage upload failed");
        }

        const { data: publicUrlData } = supabase.storage.from("uploads").getPublicUrl(uploadPath);

        return NextResponse.json({ url: publicUrlData.publicUrl });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 });
    }
}
