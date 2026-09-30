import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-nb-paper text-nb-ink flex items-center justify-center p-6 [background-image:linear-gradient(rgba(17,17,17,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(17,17,17,0.06)_1px,transparent_1px)] [background-size:32px_32px]">
            <div className="relative max-w-lg w-full text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mevy-cutout.webp" alt="" aria-hidden="true" className="mx-auto h-44 w-auto -mb-6 relative z-10 drop-shadow-[4px_6px_0_rgba(17,17,17,0.9)]" />
                <div className="rounded-[26px] border-2 border-nb-ink bg-white shadow-nb-lg p-8 pt-10">
                    <p className="font-brico font-extrabold text-[7rem] leading-none tracking-[-0.06em]">
                        4<span className="inline-block rotate-[-6deg] rounded-2xl border-2 border-nb-ink bg-nb-sun px-2 mx-1 shadow-nb">0</span>4
                    </p>
                    <h1 className="mt-4 font-brico font-extrabold text-2xl">Mevy looked everywhere.</h1>
                    <p className="mt-2 text-nb-muted">This page doesn&apos;t exist — or it moved to a new spot in the lab.</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Link href="/" className="inline-flex items-center gap-2 rounded-xl border-2 border-nb-ink bg-nb-violet text-white px-5 py-3 font-brico font-bold shadow-nb transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-nb-sm">
                            ← Back home
                        </Link>
                        <Link href="/projects" className="inline-flex items-center gap-2 rounded-xl border-2 border-nb-ink bg-white px-5 py-3 font-brico font-bold shadow-nb transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-nb-sm">
                            See projects
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
