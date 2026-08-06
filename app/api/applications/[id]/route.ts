import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import bcrypt from "bcryptjs";
import { generatePassword } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { sendWelcomeEmail, PORTAL_URL } from "@/lib/email";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const { status, role: assignedRole, ...otherUpdates } = body;

    try {
        // Fetch current application
        const { data: app, error: appError } = await db
            .from("Application")
            .select("*")
            .eq("id", params.id)
            .single();

        if (appError || !app) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        let userCredentials: { loginId?: string; password?: string; userCreated?: boolean; userId?: string; profileId?: string } = {};

        let emailDispatchResult: any = null;

        // If approving, register them into User accounts and TeamMemberProfile if not already present
        if (status === "APPROVED" || status === "ACCEPTED") {
            const targetEmail = (app.email || "").trim().toLowerCase();
            const applicantName = (app.name || "New Member").trim();

            if (targetEmail) {
                // 1. Check if user already exists
                const { data: existingUser } = await db
                    .from("User")
                    .select("id, email, name, role")
                    .eq("email", targetEmail)
                    .maybeSingle();

                let activeUserId = existingUser?.id;

                if (!existingUser) {
                    // Create new user account — default role is MEMBER until admin assigns
                    const rawPassword = generatePassword(12);
                    const hashed = await bcrypt.hash(rawPassword, 12);
                    const newUserId = uuidv4();

                    const { data: createdUser, error: userError } = await db
                        .from("User")
                        .insert({
                            id: newUserId,
                            name: applicantName,
                            email: targetEmail,
                            password: hashed,
                            role: assignedRole || "MEMBER",
                            avatar: app.photo || null,
                            updatedAt: new Date().toISOString(),
                        })
                        .select("id, name, email, role")
                        .single();

                    if (!userError && createdUser) {
                        activeUserId = createdUser.id;
                        userCredentials = {
                            userCreated: true,
                            loginId: targetEmail,
                            password: rawPassword,
                            userId: createdUser.id,
                        };
                    } else if (userError) {
                        console.error("[Applications] User creation failed:", userError);
                    }
                } else {
                    userCredentials = {
                        userCreated: false,
                        loginId: existingUser.email,
                        userId: existingUser.id,
                    };
                }

                // 2. Create in-app welcome notification
                if (activeUserId) {
                    try {
                        await db.from("Notification").insert({
                            id: uuidv4(),
                            userId: activeUserId,
                            title: "🎉 Welcome to AiRA Labs!",
                            message: "Your membership application has been accepted! Access your team tasks and change your temporary password in Settings.",
                            link: "/portal/settings",
                            read: false,
                            createdAt: new Date().toISOString(),
                        });
                    } catch {}
                }

                // 3. Dispatch official Welcome Email from info@aira-lab.in
                try {
                    const roleLabel = assignedRole || app.interest || "Team Member";

                    emailDispatchResult = await sendWelcomeEmail({
                        to: targetEmail,
                        name: applicantName,
                        password: userCredentials.password,
                        portalUrl: PORTAL_URL,
                        role: roleLabel,
                    });

                    if (!emailDispatchResult.success) {
                        console.error("[Applications] Email dispatch failed:", emailDispatchResult.error || emailDispatchResult.status);
                    } else {
                        console.log(`[Applications] Welcome email dispatched to ${targetEmail} — status: ${emailDispatchResult.status}`);
                    }
                } catch (emailErr) {
                    console.error("[Applications] Welcome email exception:", emailErr);
                    emailDispatchResult = { success: false, error: String(emailErr), status: "exception" };
                }

                // 4. Check if TeamMemberProfile exists
                const { data: existingProfiles } = await db
                    .from("TeamMemberProfile")
                    .select("id, photo")
                    .ilike("name", applicantName)
                    .limit(1);

                if (!existingProfiles || existingProfiles.length === 0) {
                    const profileId = uuidv4();
                    const memberRole = app.interest ? `${app.interest} Member` : "Team Member";
                    const teamGroup = app.interest || "Core Team";
                    const bio = app.message || "AiRA Lab Team Member";

                    const { data: createdProfile } = await db
                        .from("TeamMemberProfile")
                        .insert({
                            id: profileId,
                            name: applicantName,
                            role: memberRole,
                            teamGroup: teamGroup,
                            bio: bio,
                            photo: app.photo || "",
                            linkedin: app.linkedin || null,
                            github: app.github || null,
                            sortOrder: 10,
                            isPresident: false,
                            updatedAt: new Date().toISOString(),
                        })
                        .select("id")
                        .single();

                    if (createdProfile) {
                        userCredentials.profileId = createdProfile.id;
                    }
                } else {
                    userCredentials.profileId = existingProfiles[0].id;
                    if (!existingProfiles[0].photo && app.photo) {
                        await db.from("TeamMemberProfile").update({ photo: app.photo }).eq("id", existingProfiles[0].id);
                    }
                }
            }
        }

        // Update application status
        const updatePayload: Record<string, any> = {
            ...otherUpdates,
            status: status || app.status,
            updatedAt: new Date().toISOString(),
        };

        const { data: updatedApp, error: updateError } = await db
            .from("Application")
            .update(updatePayload)
            .eq("id", params.id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
        }

        return NextResponse.json({
            ...updatedApp,
            credentials: userCredentials,
            emailDispatch: emailDispatchResult,
        });
    } catch (error) {
        console.error("Application approval error:", error);
        return NextResponse.json({ error: "Failed to process application", details: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const deleteAssociated = searchParams.get("deleteUser") === "true";

        if (deleteAssociated) {
            // Fetch application to get email and name
            const { data: app } = await db
                .from("Application")
                .select("email, name")
                .eq("id", params.id)
                .maybeSingle();

            if (app) {
                if (app.email) {
                    await db.from("User").delete().eq("email", app.email.trim().toLowerCase());
                }
                if (app.name) {
                    await db.from("TeamMemberProfile").delete().ilike("name", app.name.trim());
                }
            }
        }

        const { error } = await db.from("Application").delete().eq("id", params.id);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete application error:", error);
        return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
    }
}
