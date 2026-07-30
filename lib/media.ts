const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".m4v", ".avi", ".mkv"];

export function isVideoUrl(url?: string | null) {
    if (!url) return false;

    const normalized = url.split("?")[0].toLowerCase();
    return VIDEO_EXTENSIONS.some((ext) => normalized.endsWith(ext));
}

export function isVideoMedia(media?: { mediaType?: string | null; url?: string | null }) {
    if (!media) return false;

    if (media.mediaType === "video" || media.mediaType?.startsWith("video/")) {
        return true;
    }

    return isVideoUrl(media.url);
}
