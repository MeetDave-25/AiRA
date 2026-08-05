import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const inputEmail = credentials.email.trim().toLowerCase();
                const inputPassword = credentials.password;

                // [1. ADMIN DEFAULT / BYPASS CREDENTIALS]
                const adminEmailEnv = (process.env.ADMIN_EMAIL || "admin@airalabs.com").toLowerCase();
                const adminPasswordEnv = process.env.ADMIN_PASSWORD || "Admin@123";

                if (
                    (inputEmail === adminEmailEnv || inputEmail === "admin@airalabs.com" || inputEmail === "admin@airalab.com") &&
                    inputPassword === adminPasswordEnv
                ) {
                    return {
                        id: "local-bypass-admin",
                        name: "AIRA Admin",
                        email: inputEmail,
                        role: "ADMIN",
                        avatar: "",
                        teams: [],
                    };
                }

                // [2. CONTENT MANAGER DEFAULT / BYPASS CREDENTIALS]
                const contentPasswordEnv = process.env.CONTENT_MANAGER_PASSWORD || "Content@123";
                if (
                    (inputEmail === "content@airalabs.com" || inputEmail === "content@airalab.com") &&
                    inputPassword === contentPasswordEnv
                ) {
                    return {
                        id: "local-bypass-content-manager",
                        name: "AiRA Content Manager",
                        email: inputEmail,
                        role: "CONTENT_MANAGER",
                        avatar: "",
                        teams: [],
                    };
                }

                // [3. CERTIFICATE MANAGER DEFAULT / BYPASS CREDENTIALS]
                const certificatePasswordEnv = process.env.CERTIFICATE_MANAGER_PASSWORD || "Certificate@123";
                if (
                    (inputEmail === "certificate@airalabs.com" || inputEmail === "certificate@airalab.com") &&
                    inputPassword === certificatePasswordEnv
                ) {
                    return {
                        id: "local-bypass-certificate-manager",
                        name: "AiRA Certificate Manager",
                        email: inputEmail,
                        role: "CERTIFICATE_MANAGER",
                        avatar: "",
                        teams: [],
                    };
                }

                // [4. DATABASE USERS]
                try {
                    const { data: user, error } = await db
                        .from("User")
                        .select("id, name, email, password, role, avatar, TeamMembership(teamId, memberRole, Team(id, name, color))")
                        .eq("email", inputEmail)
                        .single();

                    if (error || !user) return null;

                    const passwordMatch = await bcrypt.compare(inputPassword, user.password);
                    if (!passwordMatch) return null;

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar,
                        teams: (user.TeamMembership || []).map((m: any) => ({
                            id: m.Team?.id,
                            name: m.Team?.name,
                            color: m.Team?.color,
                            memberRole: m.memberRole || "TEAM_MEMBER",
                        })),
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.avatar = user.avatar;
                token.teams = user.teams;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.avatar = token.avatar;
                session.user.teams = token.teams;
            }
            return session;
        },
    },
    pages: {
        signIn: "/portal/login",
    },
    session: {
        strategy: "jwt" as const,
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
