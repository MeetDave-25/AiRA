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

                // [ADMIN BYPASS] Allow admin login via env credentials.
                if (credentials.email === "admin@airalabs.com" && credentials.password === "Admin@123") {
                    return {
                        id: "local-bypass-admin",
                        name: "AIRA Admin",
                        email: "admin@airalabs.com",
                        role: "ADMIN",
                        avatar: "",
                        teams: [],
                    };
                }

                try {
                    const { data: user, error } = await db
                        .from("User")
                        .select("id, name, email, password, role, avatar, TeamMembership(teamId, Team(id, name, color))")
                        .eq("email", credentials.email)
                        .single();

                    if (error || !user) return null;

                    const passwordMatch = await bcrypt.compare(credentials.password, user.password);
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
