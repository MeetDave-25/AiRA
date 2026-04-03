import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generatePassword } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const rawPassword = generatePassword(12);
        const hashed = await bcrypt.hash(rawPassword, 12);
        await prisma.user.update({
            where: { id: params.id },
            data: { password: hashed },
        });
        return NextResponse.json({ generatedPassword: rawPassword });
    } catch (error) {
        return NextResponse.json({ error: "Failed to regenerate password" }, { status: 500 });
    }
}
