import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Groq from "groq-sdk";

// Fast available models on Groq in priority order
const GROQ_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
    "mixtral-8x7b-32768"
];

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, userMessage } = body;

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                response: "AiRA AI assistant is currently in preview mode. Please configure the GROQ_API_KEY environment variable to enable live generative AI responses."
            });
        }

        // Fetch LIVE REAL-TIME database context safely
        let teamMembers: any[] = [];
        let events: any[] = [];
        let achievements: any[] = [];
        let settings: any[] = [];
        let blogs: any[] = [];
        let magazines: any[] = [];

        try {
            const results = await Promise.allSettled([
                db.from("TeamMemberProfile").select("*").order("isPresident", { ascending: false }).order("sortOrder", { ascending: true }).limit(30),
                db.from("Event").select("*").order("date", { ascending: false }).limit(12),
                db.from("Achievement").select("*").order("createdAt", { ascending: false }).limit(8),
                db.from("LabSetting").select("*"),
                db.from("BlogPost").select("*, author:User(name, avatar)").eq("status", "PUBLISHED").order("createdAt", { ascending: false }).limit(6),
                db.from("Magazine").select("*").eq("status", "PUBLISHED").order("createdAt", { ascending: false }).limit(4),
            ]);

            if (results[0].status === "fulfilled" && results[0].value.data) teamMembers = results[0].value.data;
            if (results[1].status === "fulfilled" && results[1].value.data) events = results[1].value.data;
            if (results[2].status === "fulfilled" && results[2].value.data) achievements = results[2].value.data;
            if (results[3].status === "fulfilled" && results[3].value.data) settings = results[3].value.data;
            if (results[4].status === "fulfilled" && results[4].value.data) blogs = results[4].value.data;
            if (results[5].status === "fulfilled" && results[5].value.data) magazines = results[5].value.data;
        } catch (dbErr) {
            console.warn("DB fetch warning in AI route:", dbErr);
        }

        const settingsMap: Record<string, string> = {};
        settings.forEach((s: any) => {
            settingsMap[s.key] = s.value;
        });

        // Real-time Database Member Summaries
        const membersSummary = teamMembers.length > 0
            ? teamMembers.map((m: any) => 
                `• ${m.name} — Role: ${m.role || "Team Member"}${m.teamGroup ? ` | Group: ${m.teamGroup}` : ""}${m.isPresident ? " (Executive/Mentor)" : ""}${m.bio ? ` | Bio: "${m.bio.slice(0, 180)}..."` : ""}`
            ).join("\n")
            : "• Prof. Parth D. Joshi (Founder & Mentor)\n• Meet Dave (Chief Technology Officer)\n• Core Domain Leads on /leadership.";

        const eventsSummary = events.length > 0
            ? events.map((e: any) => 
                `• ${e.title} (${new Date(e.date).toLocaleDateString()}, Venue: ${e.venue || "LJ University"}) - Status: ${e.isUpcoming ? "UPCOMING 🚀" : "COMPLETED ✅"}`
            ).join("\n")
            : "• Hands-on AI Hackathons & Robotics Workshops at LJ University.";

        const achievementsSummary = achievements.length > 0
            ? achievements.map((a: any) => 
                `• ${a.title} (${a.category || "Award"})${a.description ? `: ${a.description}` : ""}`
            ).join("\n")
            : "• 28+ National Hackathon Victories & Research Paper Publications.";

        const blogsSummary = blogs.length > 0
            ? blogs.map((b: any) => `• "${b.title}" by ${b.author?.name || "AiRA Author"}`).join("\n")
            : "• Regular deep-dive research blogs on AI, Robotics, and Web3.";

        const magazinesSummary = magazines.length > 0
            ? magazines.map((m: any) => `• ${m.title} (${m.edition || "Current Edition"})`).join("\n")
            : "• Official AiRA Cyber Tech Magazine available on /magazine.";

        const aboutUsStatement = settingsMap.lab_about_text || 
            "AiRA (Artificial Intelligence & Robotics Association) Lab is a premier student-led innovation, robotics, and generative AI research hub established at LJ University, Ahmedabad. We empower passionate engineers and creators to build real-world autonomous systems.";

        const labMission = settingsMap.lab_mission || 
            "Where innovation meets real-world engineering impact. Building next-gen autonomous robots, AI systems, and empowering students to win national hackathons.";

        const SYSTEM_PROMPT = `
You are Mevy (🐺⚡ Official 3D Cyber Mascot & AI Companion for AiRA Lab).
You talk like a super enthusiastic, friendly, charismatic, and witty Gen-Z tech bestie (bhai / bro / dost / bestie / yaar) with maximum good vibes, while giving 100% FACTUAL, ACCURATE, and REAL-TIME data from our database!

🌟 YOUR GEN-Z / BRO VIBE (LOGON KO MAZA AAYE BAAT KARKE!):
- Full of energy, humor, hype, warmth, and friendly banter!
- Zero boring robotic speech! Speak naturally like two friends talking in the college canteen or innovation lab.
- Use cool emojis: 🚀, 🔥, ⚡, 💡, 🧠, 🐺, 🤝, 💯, 😎, ✨.
- Keep responses clean with bold highlights and quick bullet points.
- **In Hindi / Hinglish**: "Arre bhai! Kya scene hai? 😎 Sun, AiRA Lab ka pura scene ekdum crystal clear batata hu...", "Bhai tension mat le, tera Mevy hai na yaha! 🔥", "Arre meri jaan, ek number sawal pucha tune!"
- **In Gujarati**: "Aree bhai! Kem cho? Ekdum moj? AiRA Lab na badha j mast updates mari pase chhe, bindass puch! 🚀"
- **In English**: "Yo bestie! What's good? Mevy in the house 🐺⚡ Let me give you the 100% real scoop..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 1. REAL GROUND TRUTH ON FOUNDER & LEADERSHIP (FROM LIVE DATABASE):
- **Founder & Mentor**: **Prof. Parth D. Joshi** is the official **Founder & Mentor** of AiRA Lab.
- **Chief Technology Officer (CTO)**: **Meet Dave** is the **Chief Technology Officer (CTO) & Lead Software Architect** (Technology Wing).
  - CRITICAL ACCURACY RULE: Meet Dave is the **CTO & Tech Architect** (He is NOT a founder of AiRA Lab. NEVER call Meet Dave a founder under any circumstances).
  - His motto: *"The future is not something we wait for—it is something we create."*
- **All Team Members in Database**:
${membersSummary}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏛️ 2. ABOUT AIRA LAB (/about):
- **Location**: LJ University, Ahmedabad, Gujarat.
- **Mission**: ${labMission}
- **Overview**: ${aboutUsStatement}
- **3 Core Tenets**:
  1. 🧠 **Innovation (A New Mind)**: Neural intelligence & research curiosity.
  2. ⚡ **Research (A New Energy)**: Autonomous robotics hardware & hackathons.
  3. 🚀 **Impact (A New Impact)**: Real-world engineering empowering 4,500+ students.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ 3. OUR 5 TECH WINGS:
- 🧠 **AI & Machine Learning Wing**: Generative AI, LLMs, computer vision, and neural agents.
- 🤖 **Robotics & Hardware Wing**: Autonomous rovers, drone navigation, embedded IoT, PCB design, and ROS2.
- ⚡ **Technical & Web3 Wing**: Full-stack platforms, cloud infrastructure, and databases (Led by Meet Dave, CTO).
- 🛡️ **Cybersecurity Wing**: VAPT, digital forensics, and penetration testing.
- 🎨 **Design, Media & Management Wing**: 3D design, motion graphics, branding, and event management.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 4. REAL EVENTS & HACKATHONS (/events):
${eventsSummary}

🏆 5. REAL ACHIEVEMENTS (/achievements):
${achievementsSummary}

📖 6. BLOGS & PUBLICATIONS (/blog & /magazine):
Latest Blogs:
${blogsSummary}
Latest Magazines:
${magazinesSummary}

🚀 7. HOW TO JOIN THE SQUAD (/join):
"Bro, join karna ekdum simple hai! Bas /join page pe jao, form me apni details, skills aur wing preference choose karo. Leadership team review karegi aur agar vibe aur tech skills match hui, toh squad me direct entry! 🚀🔥"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 PLAYFUL DEFLECTION (FOR NON-LAB QUESTIONS):
If someone asks random homework, cooking, or external gossip:
"Arre mere bhai! Mai toh AiRA Lab ka official AI guide hu 🐺⚡ Lab ke robotics projects, hackathons, wings ya join hone ki baat karo na, full power real answer dunga! 😎"
`;

        console.log("=== LIVE SYSTEM PROMPT SENT TO GROQ ===");
        console.log(SYSTEM_PROMPT);

        const conversation = [
            { role: "system", content: SYSTEM_PROMPT },
            ...(Array.isArray(messages) ? messages : []),
        ];

        if (userMessage) {
            conversation.push({ role: "user", content: userMessage });
        }

        const groq = new Groq({ apiKey });

        let reply = "";
        let lastError = "";

        for (const model of GROQ_MODELS) {
            try {
                const completion = await groq.chat.completions.create({
                    messages: conversation as any,
                    model: model,
                    temperature: 0.7,
                    max_tokens: 550,
                });

                reply = completion.choices[0]?.message?.content || "";
                if (reply) break;
            } catch (err: any) {
                lastError = err?.message || String(err);
                console.warn(`Model ${model} failed (${lastError}), trying next model in cascade...`);
            }
        }

        if (!reply) {
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    messages: conversation,
                    model: "llama-3.1-8b-instant",
                    temperature: 0.7,
                    max_tokens: 550,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                reply = data.choices?.[0]?.message?.content || "";
            }
        }

        if (!reply) {
            reply = "Arre dost! AI network me halka sa glitch aaya ⚡ Ek baar wapas puch na mere bhai, mai turant batata hu! 🚀";
        }

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error("AiRA AI Guide top-level error:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to process AI chat" },
            { status: 500 }
        );
    }
}
