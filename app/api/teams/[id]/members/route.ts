import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generatePassword } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-guard";
import { addTeamMemberOffline, isDbOfflineError, listTeamMembershipsOffline } from "@/lib/offline-admin-store";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const memberships = await prisma.teamMembership.findMany({
            where: { teamId: params.id },
            include: { user: { select: { id: true, name: true, email: true, role: true, avatar: true } } },
        });
        return NextResponse.json(memberships);
    } catch (error) {
        if (isDbOfflineError(error)) {
            const memberships = await listTeamMembershipsOffline(params.id);
            return NextResponse.json(memberships);
        }
        return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();

    try {
        const { name, email, role } = body;

        const normalizedName = String(name || "").trim();
        if (!normalizedName) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        let loginId = String(email || "").trim().toLowerCase();
        if (!loginId) {
            const slug = normalizedName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, ".")
                .replace(/^\.+|\.+$/g, "") || "member";

            loginId = `${slug}@airalabs.local`;
            let counter = 1;
            while (await prisma.user.findUnique({ where: { email: loginId } })) {
                loginId = `${slug}.${counter}@airalabs.local`;
                counter += 1;
            }
        }

        const rawPassword = generatePassword(12);
        const hashed = await bcrypt.hash(rawPassword, 12);

        // Upsert user (create or get existing)
        let user = await prisma.user.findUnique({ where: { email: loginId } });
        if (!user) {
            user = await prisma.user.create({
                data: { name: normalizedName, email: loginId, password: hashed, role: role || "TEAM_MEMBER" },
            });
        } else {
            // Update password and role
            user = await prisma.user.update({
                where: { email: loginId },
                data: { name: normalizedName, password: hashed, role: role || user.role },
            });
        }

        const membership = await prisma.teamMembership.upsert({
            where: { userId_teamId: { userId: user.id, teamId: params.id } },
            update: {},
            create: { userId: user.id, teamId: params.id },
        });

        return NextResponse.json({
            membership,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            generatedLoginId: loginId,
            generatedPassword: rawPassword, // shown once to admin
        }, { status: 201 });
    } catch (error) {
        if (isDbOfflineError(error)) {
            try {
                const result = await addTeamMemberOffline(params.id, body);
                return NextResponse.json(result, { status: 201 });
            } catch (offlineError) {
                return NextResponse.json({ error: offlineError instanceof Error ? offlineError.message : "Failed to add member" }, { status: 400 });
            }
        }
        console.error("Add member error:", error);
        return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
    }
}
