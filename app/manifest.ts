import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "AiRA Lab",
        short_name: "AiRA Lab",
        description: "AiRA Lab innovation and research platform with events, achievements, and media galleries.",
        start_url: "/",
        display: "standalone",
        background_color: "#020817",
        theme_color: "#020817",
        orientation: "portrait",
        scope: "/",
        icons: [
            {
                src: "/icon.svg",
                sizes: "any",
                type: "image/svg+xml",
            },
            {
                src: "/apple-icon.svg",
                sizes: "any",
                type: "image/svg+xml",
            },
            {
                src: "/apple-icon.svg",
                sizes: "any",
                type: "image/svg+xml",
            },
        ],
    };
}
