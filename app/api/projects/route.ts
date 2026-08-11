import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const search = searchParams.get("search");
        const featured = searchParams.get("featured");

        let query = db
            .from("Project")
            .select("*, reviews:ProjectReview(*)")
            .eq("status", "PUBLISHED")
            .order("createdAt", { ascending: false });

        if (category && category !== "ALL") {
            query = query.ilike("category", `%${category}%`);
        }

        if (featured === "true") {
            query = query.eq("featured", true);
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,tagline.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        const projects = (data || []).map((p: any) => {
            const reviews = p.reviews || [];
            const avgRating = reviews.length > 0
                ? Number((reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1))
                : 5.0;

            return {
                ...p,
                avgRating,
                reviewCount: reviews.length,
            };
        });

        return NextResponse.json(projects);
    } catch (error: any) {
        console.error("Fetch projects error:", error);
        return NextResponse.json([], { status: 200 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions as any);
        const body = await req.json();

        const title = (body.title || "").trim();
        const tagline = (body.tagline || "").trim();
        const description = (body.description || "").trim();
        const category = (body.category || "AI & Machine Learning").trim();
        const coverImage = (body.coverImage || "").trim() || null;
        const demoUrl = (body.demoUrl || "").trim() || null;
        const githubUrl = (body.githubUrl || "").trim() || null;
        const tags = Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(",").map((t: string) => t.trim()) : []);
        const authorName = (body.authorName || session?.user?.name || "AiRA Community Contributor").trim();

        if (!title || !description) {
            return NextResponse.json({ error: "Project title and description are required" }, { status: 400 });
        }

        const newProject = {
            id: uuidv4(),
            title,
            tagline: tagline || null,
            description,
            category,
            coverImage,
            demoUrl,
            githubUrl,
            tags,
            featured: body.featured === true,
            status: "PUBLISHED",
            authorId: session?.user?.id || null,
            authorName,
            likes: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const { data, error } = await db
            .from("Project")
            .insert(newProject)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error("Create project error:", error);
        return NextResponse.json({ error: error?.message || "Failed to create project" }, { status: 500 });
    }
}
