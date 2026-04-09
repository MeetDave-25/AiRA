import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { data: images, error } = await db
        .from("EventImage")
        .select("*")
        .eq("eventId", params.id)
        .order("isPrimary", { ascending: false })
        .order("createdAt", { ascending: true });

    if (error) return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
    return NextResponse.json(images || []);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const formData = await req.formData();
        const files = formData.getAll("images") as File[];
        const isPrimary = formData.get("isPrimary") === "true";

        const uploadDir = path.join(process.cwd(), "public", "uploads", "events");
        await mkdir(uploadDir, { recursive: true });

        const savedImages = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const ext = file.name.split(".").pop();
            const filename = `${uuidv4()}.${ext}`;
            const filepath = path.join(uploadDir, filename);
            await writeFile(filepath, buffer);

            const { data: image, error } = await db
                .from("EventImage")
                .insert({ id: uuidv4(), eventId: params.id, url: `/uploads/events/${filename}`, isPrimary: i === 0 && isPrimary })
                .select()
                .single();

            if (!error && image) savedImages.push(image);
        }

        return NextResponse.json(savedImages, { status: 201 });
    } catch (error) {
        console.error("Image upload error:", error);
        return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
    }
}
