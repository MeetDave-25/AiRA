export default function PublicLoading() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-nb-paper text-nb-ink">
            <div className="flex gap-2">
                {["bg-nb-sky", "bg-nb-peach", "bg-nb-mint", "bg-nb-lilac"].map((c, i) => (
                    <span key={c} className={`w-5 h-5 rounded-md border-2 border-nb-ink ${c} animate-bounce`} style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
            </div>
            <span className="mt-5 font-mono text-xs uppercase tracking-[0.16em] text-nb-muted">Loading…</span>
        </div>
    );
}
