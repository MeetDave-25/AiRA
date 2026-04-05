"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, Mail, Phone, Badge, Briefcase, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function TeamMembersPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const user = session?.user as any;

    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [teamData, setTeamData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.teams || user.teams.length === 0) {
            router.push("/portal/dashboard");
            return;
        }

        const loadData = async () => {
            try {
                const teamId = user.teams[0].id;

                // Fetch team
                const teamRes = await fetch(`/api/teams?teamId=${teamId}`);
                const teams = teamRes.ok ? await teamRes.json() : [];
                const team = teams.find((t: any) => t.id === teamId);
                setTeamData(team);

                // Fetch team members
                if (team?.memberships) {
                    const memberProfiles = team.memberships.map((m: any) => ({
                        ...m.user,
                        joinedAt: m.joinedAt,
                    }));
                    setTeamMembers(memberProfiles);
                }
            } catch (error) {
                console.error("Error loading team members:", error);
                toast.error("Failed to load team members");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-aira-cyan/30 border-t-aira-cyan rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading team members...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-8 border border-white/5"
            >
                <h1 className="font-orbitron font-bold text-3xl text-white mb-2">
                    Team Members
                </h1>
                <p className="text-slate-400">
                    {teamMembers.length} members in {teamData?.name}
                </p>
            </motion.div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member, idx) => {
                    const roleColor: Record<string, string> = {
                        ADMIN: "bg-aira-cyan/20 text-aira-cyan",
                        TEAM_LEAD: "bg-aira-purple/20 text-aira-purple",
                        TEAM_MEMBER: "bg-slate-400/20 text-slate-300",
                    };
                    return (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass rounded-xl border border-white/5 p-6 hover:border-aira-cyan/30 transition-all"
                        >
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-aira-cyan to-aira-purple flex items-center justify-center text-white font-bold text-xl mb-4">
                                {member.name?.charAt(0).toUpperCase()}
                            </div>

                            {/* Info */}
                            <h3 className="font-bold text-lg text-white mb-1">{member.name}</h3>
                            
                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Mail size={14} />
                                    <span className="truncate">{member.email}</span>
                                </div>
                                {member.createdAt && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Calendar size={14} />
                                        <span>Joined {new Date(member.createdAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Role Badge */}
                            <div className="flex items-center justify-between">
                                <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 ${roleColor[member.role] || roleColor.TEAM_MEMBER}`}>
                                    <Badge size={12} />
                                    {member.role.replace("_", " ")}
                                </span>
                                {member.avatar && (
                                    <img
                                        src={member.avatar}
                                        alt={member.name}
                                        className="w-8 h-8 rounded-full border border-white/10"
                                    />
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {teamMembers.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-slate-700 mb-4 opacity-50" />
                    <p className="text-slate-400">No team members yet</p>
                </div>
            )}
        </div>
    );
}
