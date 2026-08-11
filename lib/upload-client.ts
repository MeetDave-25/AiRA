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

/**
 * Uploads file directly using signed URLs with automatic fallback to server-side multipart API
 */
export async function uploadDirectFile(file: File, options?: { bucket?: UploadBucket; folder?: string }): Promise<UploadedFile> {
    const preparedFile = file.type.startsWith("image/") ? await compressImage(file) : file;

    // Strategy 1: Attempt direct signed upload
    try {
        const signed = await createSignedUpload({
            bucket: options?.bucket,
            folder: options?.folder || "general",
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

        if (!error && signed.publicUrl) {
            return {
                url: signed.publicUrl,
                path: signed.path,
                mediaType: preparedFile.type || file.type || "application/octet-stream",
            };
        }
    } catch (e) {
        console.warn("[uploadDirectFile] Signed upload attempt failed, falling back to direct server upload:", e);
    }

    // Strategy 2: Server-side fallback upload via FormData
    const formData = new FormData();
    formData.append("file", preparedFile);
    formData.append("type", options?.folder || "general");

    const fallbackRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });

    const fallbackData = await fallbackRes.json().catch(() => ({}));
    if (!fallbackRes.ok || !fallbackData.url) {
        throw new Error(fallbackData.error || "Failed to upload image");
    }

    return {
        url: fallbackData.url,
        path: fallbackData.path || "",
        mediaType: preparedFile.type || file.type || "application/octet-stream",
    };
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
