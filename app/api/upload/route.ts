import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireAdmin } from "@/lib/admin-guard";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string || "general";

        if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

        const ext = file.name.split(".").pop();
        const filename = `${uuidv4()}.${ext}`;
        const uploadPath = `${type}/${filename}`; // Type defines the subfolder

        const { error: storageError } = await db.storage
            .from("uploads")
            .upload(uploadPath, file, { cacheControl: "3600", upsert: false });

        if (storageError) throw storageError;

        const { data: publicUrlData } = db.storage.from("uploads").getPublicUrl(uploadPath);

        return NextResponse.json({ url: publicUrlData.publicUrl });
    } catch (error) {
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
