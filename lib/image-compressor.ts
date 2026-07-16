// Client-side image compression utility using HTML Canvas
// This ensures images gracefully bypass Vercel's strict 4.5MB Serverless Function payload limit.

export const compressImage = async (file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.85): Promise<File> => {
    return new Promise((resolve, reject) => {
        // Return original if it's exceptionally small anyway (< 500KB)
        if (file.size < 500 * 1024) {
            return resolve(file);
        }

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            let { width, height } = img;

            // Calculate aspect ratio
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                return resolve(file); // fallback
            }

            // Draw image on canvas, resized
            ctx.drawImage(img, 0, 0, width, height);

            // Export to blob as JPEG or WEBP (WEBP is extremely efficient)
            const exportType = file.type === "image/png" ? "image/png" : "image/webp";

            canvas.toBlob((blob) => {
                if (!blob) {
                    return resolve(file); // fallback
                }

                // Create a new File from the Blob
                // If converted to webp, rename extension to .webp
                let newFileName = file.name;
                if (exportType === "image/webp" && !newFileName.endsWith(".webp")) {
                    newFileName = newFileName.replace(/\.[^/.]+$/, ".webp");
                }

                const compressedFile = new File([blob], newFileName, {
                    type: exportType,
                    lastModified: Date.now(),
                });

                // If for some reason compression made it bigger (rare but possible), return original
                if (compressedFile.size > file.size) {
                    return resolve(file);
                }

                resolve(compressedFile);
            }, exportType, quality);
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);
            console.error("Compression loading error", err);
            resolve(file); // fallback to original on error
        };

        img.src = objectUrl;
    });
};
