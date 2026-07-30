import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/image-compressor";

type UploadBucket = "uploads" | "events";

type SignedUploadPayload = {
    bucket?: UploadBucket;
    folder?: string;
    filename: string;
    contentType: string;
};

type SignedUploadResponse = {
    bucket: UploadBucket;
    path: string;
    token: string;
    publicUrl: string;
};

export type UploadedFile = {
    url: string;
    path: string;
    mediaType: string;
};

async function createSignedUpload(payload: SignedUploadPayload): Promise<SignedUploadResponse> {
    const res = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || "Failed to prepare upload");
    }

    return data;
}

export async function uploadDirectFile(file: File, options?: { bucket?: UploadBucket; folder?: string }) {
    const preparedFile = file.type.startsWith("image/") ? await compressImage(file) : file;
    const signed = await createSignedUpload({
        bucket: options?.bucket,
        folder: options?.folder,
        filename: preparedFile.name,
        contentType: preparedFile.type || file.type || "application/octet-stream",
    });

    const { error } = await supabase.storage.from(signed.bucket).uploadToSignedUrl(
        signed.path,
        signed.token,
        preparedFile,
        {
            cacheControl: "3600",
            upsert: false,
            contentType: preparedFile.type || file.type || "application/octet-stream",
        }
    );

    if (error) {
        throw new Error(error.message || "Upload failed");
    }

    return {
        url: signed.publicUrl,
        path: signed.path,
        mediaType: preparedFile.type || file.type || "application/octet-stream",
    } satisfies UploadedFile;
}

export async function uploadDirectFiles(
    files: File[],
    options?: { bucket?: UploadBucket; folder?: string; concurrency?: number }
) {
    const concurrency = Math.max(1, options?.concurrency ?? 2);
    const uploads: UploadedFile[] = [];

    for (let index = 0; index < files.length; index += concurrency) {
        const chunk = files.slice(index, index + concurrency);
        const chunkResults = await Promise.all(
            chunk.map((file) => uploadDirectFile(file, options))
        );
        uploads.push(...chunkResults);
    }

    return uploads;
}
