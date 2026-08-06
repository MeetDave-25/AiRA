import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { v4 as uuidv4 } from "uuid";

const BUILT_IN_FIELDS = [
    { label: "First Name",   fieldType: "text",   placeholder: "Enter your first name",   isRequired: true,  sortOrder: 0 },
    { label: "Middle Name",  fieldType: "text",   placeholder: "Enter your middle name",  isRequired: false, sortOrder: 1 },
    { label: "Last Name",    fieldType: "text",   placeholder: "Enter your last name",    isRequired: true,  sortOrder: 2 },
    { label: "Email",        fieldType: "email",  placeholder: "Enter your email address",isRequired: true,  sortOrder: 3 },
    { label: "Phone",        fieldType: "phone",  placeholder: "Enter your phone number", isRequired: true,  sortOrder: 4 },
    { label: "Roll No",      fieldType: "text",   placeholder: "Enter your roll number",  isRequired: true,  sortOrder: 5 },
    { label: "Year",         fieldType: "select", placeholder: "",                        isRequired: true,  sortOrder: 6,
      options: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
    { label: "Semester",     fieldType: "select", placeholder: "",                        isRequired: true,  sortOrder: 7,
      options: ["1", "2", "3", "4", "5", "6", "7", "8"] },
];

// GET — public: fetch form + fields for an event
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id: eventId } = params;

    const { data: form, error } = await db
        .from("EventForm")
        .select("*, EventFormField(*)")
        .eq("eventId", eventId)
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!form) return NextResponse.json({ form: null });

    const fields = (form.EventFormField || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder);

    return NextResponse.json({ form: { ...form, fields } });
}

// POST — admin: create a form for the event
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id: eventId } = params;
    const body = await req.json().catch(() => ({}));

    // Check if form already exists
    const { data: existing } = await db
        .from("EventForm")
        .select("id")
        .eq("eventId", eventId)
        .maybeSingle();

    if (existing) {
        return NextResponse.json({ error: "Form already exists for this event. Use PATCH to update." }, { status: 409 });
    }

    const formId = uuidv4();
    const now = new Date().toISOString();

    const { data: form, error: formError } = await db
        .from("EventForm")
        .insert({
            id: formId,
            eventId,
            isOpen: body.isOpen ?? true,
            deadline: body.deadline || null,
            maxSlots: body.maxSlots || null,
            createdAt: now,
            updatedAt: now,
        })
        .select()
        .single();

    if (formError) return NextResponse.json({ error: formError.message }, { status: 500 });

    // Insert built-in fields
    const builtInInserts = BUILT_IN_FIELDS.map((f) => ({
        id: uuidv4(),
        formId,
        label: f.label,
        fieldType: f.fieldType,
        isRequired: f.isRequired,
        placeholder: f.placeholder || null,
        options: f.options || [],
        sortOrder: f.sortOrder,
        isBuiltIn: true,
    }));

    await db.from("EventFormField").insert(builtInInserts);

    const { data: fields } = await db
        .from("EventFormField")
        .select("*")
        .eq("formId", formId)
        .order("sortOrder");

    return NextResponse.json({ form: { ...form, fields: fields || [] } }, { status: 201 });
}

// PATCH — admin: update form settings (isOpen, deadline, maxSlots)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id: eventId } = params;
    const body = await req.json().catch(() => ({}));

    const { data: form, error } = await db
        .from("EventForm")
        .update({ ...body, updatedAt: new Date().toISOString() })
        .eq("eventId", eventId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ form });
}

// DELETE — admin: delete the entire form (and all registrations via cascade)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { error } = await db
        .from("EventForm")
        .delete()
        .eq("eventId", params.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
