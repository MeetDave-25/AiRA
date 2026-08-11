import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = session.user.email.trim().toLowerCase();

        // 1. Fetch User Record
        const { data: user, error: userError } = await db
            .from("User")
            .select("id, name, email, role, avatar, createdAt")
            .eq("email", email)
            .single();

        if (userError || !user) {
            // Handle mock/bypass accounts gracefully
            return NextResponse.json({
                user: {
                    name: session.user.name || "User",
                    email: email,
                    role: (session.user as any)?.role || "TEAM_MEMBER",
                    avatar: (session.user as any)?.avatar || "",
                    bio: "",
                    linkedin: "",
                    github: "",
                }
            });
        }

        // 2. Fetch corresponding TeamMemberProfile (by matching name or email)
        let bio = "";
        let linkedin = "";
        let github = "";
        let teamGroup = "";
        let memberRole = "";

        const { data: profiles } = await db
            .from("TeamMemberProfile")
            .select("bio, linkedin, github, teamGroup, role")
            .ilike("name", user.name)
            .limit(1);

        if (profiles && profiles.length > 0) {
            bio = profiles[0].bio || "";
            linkedin = profiles[0].linkedin || "";
            github = profiles[0].github || "";
            teamGroup = profiles[0].teamGroup || "";
            memberRole = profiles[0].role || "";
        }

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || "",
                bio,
                linkedin,
                github,
                teamGroup,
                memberRole,
                createdAt: user.createdAt,
            }
        });
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const email = session.user.email.trim().toLowerCase();

        const name = (body.name || "").trim().slice(0, 100);
        const avatar = (body.avatar || "").trim();
        const linkedin = (body.linkedin || "").trim().slice(0, 255);
        const github = (body.github || "").trim().slice(0, 255);
        const bio = (body.bio || "").trim().slice(0, 3000);

        if (!name) {
            return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
        }

        // Word count check
        const wordCount = bio ? bio.split(/\s+/).length : 0;
        if (wordCount > 500) {
            return NextResponse.json({ error: `Bio cannot exceed 500 words (currently ${wordCount})` }, { status: 400 });
        }

        // 1. Update User table
        const { data: updatedUser, error: updateError } = await db
            .from("User")
            .update({
                name,
                avatar: avatar || null,
                updatedAt: new Date().toISOString(),
            })
            .eq("email", email)
            .select("id, name, email, role, avatar")
            .single();

        if (updateError) {
            console.error("Failed to update User record:", updateError);
        }

        // 2. Sync with TeamMemberProfile
        const previousName = session.user.name || name;
        const { data: existingProfiles } = await db
            .from("TeamMemberProfile")
            .select("id")
            .or(`name.ilike.${previousName},name.ilike.${name}`)
            .limit(1);

        if (existingProfiles && existingProfiles.length > 0) {
            // Update existing profile
            await db
                .from("TeamMemberProfile")
                .update({
                    name,
                    photo: avatar || null,
                    linkedin: linkedin || null,
                    github: github || null,
                    bio: bio || null,
                    updatedAt: new Date().toISOString(),
                })
                .eq("id", existingProfiles[0].id);
        } else {
            // Create a new public profile for this user if not existing
            await db.from("TeamMemberProfile").insert({
                id: uuidv4(),
                name,
                role: (session.user as any)?.role ? (session.user as any).role.replace(/_/g, " ") : "Member",
                bio: bio || null,
                photo: avatar || null,
                linkedin: linkedin || null,
                github: github || null,
                teamGroup: "Core Team",
                sortOrder: 10,
                isPresident: false,
                updatedAt: new Date().toISOString(),
            });
        }

        return NextResponse.json({
            success: true,
            user: {
                name,
                email,
                avatar,
                linkedin,
                github,
                bio,
            },
            message: "Profile updated successfully!",
        });
    } catch (error) {
        console.error("Failed to update profile:", error);
        return NextResponse.json({ error: "Failed to update profile", details: String(error) }, { status: 500 });
    }
}
