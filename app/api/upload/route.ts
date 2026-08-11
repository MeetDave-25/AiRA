import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = (formData.get("type") as string) || "general";

        const isPublicApplicationUpload = type === "applications" || type === "applicant";

        if (!isPublicApplicationUpload) {
            const session = await getServerSession(authOptions);
            if (!session?.user) {
                return NextResponse.json({ error: "Unauthorized: Please log in to upload files" }, { status: 401 });
            }
        }

        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        // Validate image/file size (< 15MB)
        if (file.size > 15 * 1024 * 1024) {
            return NextResponse.json({ error: "File size must be less than 15MB" }, { status: 400 });
        }

        const supabase = createSupabaseAdmin();
        const ext = file.name.split(".").pop();
        const safeExt = ext ? `.${ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}` : "";
        const filename = `${uuidv4()}${safeExt}`;
        const uploadPath = `${type}/${filename}`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { error: storageError } = await supabase.storage
            .from("uploads")
            .upload(uploadPath, buffer, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type || "application/octet-stream",
            });

        if (storageError) {
            console.error("Supabase Storage Error:", storageError);
            throw new Error(storageError.message || "Storage upload failed");
        }

        const { data: publicUrlData } = supabase.storage.from("uploads").getPublicUrl(uploadPath);

        return NextResponse.json({ url: publicUrlData.publicUrl, path: uploadPath });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 });
    }
}
