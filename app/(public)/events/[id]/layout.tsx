import type { Metadata } from "next";
import { fetchRow, pageMetadata, toMetaDescription } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";

type EventRow = {
    title: string;
    date: string;
    venue: string;
    description?: string | null;
    objective?: string | null;
    organizedBy?: string | null;
    EventImage?: { url: string; isPrimary: boolean }[];
};

const isImage = (url?: string) => !!url && !/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);

async function getEvent(id: string) {
    return fetchRow<EventRow>("Event", id, "title, date, venue, description, objective, organizedBy, EventImage(url, isPrimary)");
}

function imagesOf(event: EventRow) {
    return [...(event.EventImage ?? [])]
        .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
        .map((i) => i.url)
        .filter(isImage);
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const event = await getEvent(params.id);
    if (!event) return pageMetadata({ title: "Event", description: siteConfig.description, path: `/events/${params.id}`, noIndex: true });
    return pageMetadata({
        title: event.title,
        description: toMetaDescription(event.description || event.objective || `${event.title} at ${event.venue}, organised by AiRA Lab.`),
        path: `/events/${params.id}`,
        image: imagesOf(event)[0],
    });
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
    const event = await getEvent(params.id);
    const jsonLd = event && {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        startDate: event.date,
        description: toMetaDescription(event.description || event.objective, 300),
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
            "@type": "Place",
            name: event.venue,
            address: `${siteConfig.address.city}, ${siteConfig.address.region}, India`,
        },
        image: imagesOf(event).slice(0, 3),
        organizer: { "@type": "Organization", name: event.organizedBy || siteConfig.name, url: absoluteUrl("/") },
        url: absoluteUrl(`/events/${params.id}`),
    };
    return (
        <>
            {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
            {children}
        </>
    );
}
