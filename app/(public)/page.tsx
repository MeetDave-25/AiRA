import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import LabHome from "@/components/home/lab/LabHome";

export const metadata = {
    ...pageMetadata({ title: siteConfig.title, description: siteConfig.description, path: "/" }),
    // Home uses the full brand title without the "| AiRA Lab" template suffix.
    title: { absolute: siteConfig.title },
};

export default function Page() {
    return <LabHome />;
}
