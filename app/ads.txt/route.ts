import { NextResponse } from "next/server";

export async function GET() {
    const content = "google.com, pub-3747182240775238, DIRECT, f08c47fec0942fa0\n";
    return new NextResponse(content, {
        headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "public, max-age=86400",
        },
    });
}
