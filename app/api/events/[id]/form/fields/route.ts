import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { v4 as uuidv4 } from "uuid";

// POST — add a custom field to the form
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id: eventId } = params;
    const body = await req.json();

    // Get formId from eventId
    const { data: form } = await db
        .from("EventForm")
        .select("id")
        .eq("eventId", eventId)
        .maybeSingle();

    if (!form) return NextResponse.json({ error: "Form not found for this event" }, { status: 404 });

    // Get max sortOrder
    const { data: existing } = await db
        .from("EventFormField")
        .select("sortOrder")
        .eq("formId", form.id)
        .order("sortOrder", { ascending: false })
        .limit(1);

    const maxOrder = existing?.[0]?.sortOrder ?? 0;

    const { data: field, error } = await db
        .from("EventFormField")
        .insert({
            id: uuidv4(),
            formId: form.id,
            label: body.label || "Custom Field",
            fieldType: body.fieldType || "text",
            isRequired: body.isRequired ?? false,
            placeholder: body.placeholder || null,
            options: body.options || [],
            sortOrder: maxOrder + 1,
            isBuiltIn: false,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ field }, { status: 201 });
}

// PUT — update all fields (reorder + edit)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id: eventId } = params;
    const { fields } = await req.json();

    if (!Array.isArray(fields)) {
        return NextResponse.json({ error: "fields must be an array" }, { status: 400 });
    }

    const { data: form } = await db
        .from("EventForm")
        .select("id")
        .eq("eventId", eventId)
        .maybeSingle();

    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    // Update each field individually
    const updates = fields.map((f: any) =>
        db.from("EventFormField")
            .update({
                label: f.label,
                fieldType: f.fieldType,
                isRequired: f.isRequired,
                placeholder: f.placeholder || null,
                options: f.options || [],
                sortOrder: f.sortOrder,
            })
            .eq("id", f.id)
            .eq("formId", form.id)
    );

    await Promise.all(updates);

    const { data: updatedFields } = await db
        .from("EventFormField")
        .select("*")
        .eq("formId", form.id)
        .order("sortOrder");

    return NextResponse.json({ fields: updatedFields || [] });
}
