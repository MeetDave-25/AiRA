/** Loading state for the admin/member console: three bouncing blocks in the brand colours. */
export default function ConsoleLoader({ label = "Opening the lab…" }: { label?: string }) {
    return (
        <div className="flex flex-col items-center gap-4" role="status" aria-live="polite">
            <div className="flex items-end gap-2 h-10">
                {["bg-nb-sun", "bg-nb-lilac", "bg-nb-mint"].map((c, i) => (
                    <span
                        key={c}
                        className={`w-5 h-5 rounded-md border-2 border-nb-ink shadow-[2px_2px_0_0_#6C5CE7] animate-bounce ${c}`}
                        style={{ animationDelay: `${i * 0.12}s` }}
                    />
                ))}
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#F3EFE4]/60">{label}</p>
        </div>
    );
}
