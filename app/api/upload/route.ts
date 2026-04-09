import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string || "general";

        if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

        const uploadDir = path.join(process.cwd(), "public", "uploads", type);
        await mkdir(uploadDir, { recursive: true });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = file.name.split(".").pop();
        const filename = `${uuidv4()}.${ext}`;
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        return NextResponse.json({ url: `/uploads/${type}/${filename}` });
    } catch (error) {
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
