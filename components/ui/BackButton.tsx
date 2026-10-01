"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const BackButton = () => {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 mb-5 rounded-lg border-2 border-[#F3EFE4]/15 px-3 py-1.5 font-brico font-bold text-sm text-[#F3EFE4]/75 hover:text-nb-ink hover:bg-nb-sun hover:border-nb-ink transition-colors"
        >
            <ChevronLeft size={16} />
            Back
        </button>
    );
};

export default BackButton;
