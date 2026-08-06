import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// DELETE — remove a custom field (built-in fields are protected)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; fieldId: string } }
) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { fieldId } = params;

    // Only allow deleting non-built-in fields
    const { data: field } = await db
        .from("EventFormField")
        .select("id, isBuiltIn")
        .eq("id", fieldId)
        .maybeSingle();

    if (!field) return NextResponse.json({ error: "Field not found" }, { status: 404 });
    if (field.isBuiltIn) {
        return NextResponse.json({ error: "Built-in fields cannot be deleted" }, { status: 403 });
    }

    const { error } = await db.from("EventFormField").delete().eq("id", fieldId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}

// PATCH — update a single field
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string; fieldId: string } }
) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const { fieldId } = params;

    const { data: field, error } = await db
        .from("EventFormField")
        .update({
            label: body.label,
            fieldType: body.fieldType,
            isRequired: body.isRequired,
            placeholder: body.placeholder || null,
            options: body.options || [],
            sortOrder: body.sortOrder,
        })
        .eq("id", fieldId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ field });
}
