import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";


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

                // [EMERGENCY BYPASS] Since Neon DB cannot be reached locally,
                // allow admin login to preview the UI without the database setup.
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
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                        include: {
                            memberships: { include: { team: true } },
                        },
                    });

                    if (!user) return null;

                    const passwordMatch = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );
                    if (!passwordMatch) return null;

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        avatar: user.avatar,
                        teams: user.memberships.map((m) => ({
                            id: m.team.id,
                            name: m.team.name,
                            color: m.team.color,
                        })),
                    };
                } catch (e) {
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
