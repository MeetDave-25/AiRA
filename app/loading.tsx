"use client";

export default function GlobalLoading() {
    return (
        <div className="fixed inset-0 z-[9999] bg-[#060B14] flex flex-col items-center justify-center p-4">
            <div className="relative flex items-center justify-center">
                {/* Outer spinning ring */}
                <div className="w-20 h-20 rounded-full border-2 border-slate-800 border-t-[#00D4FF] border-r-[#7C3AED] animate-spin" />
                
                {/* Inner counter-spinning glowing ring */}
                <div className="absolute w-12 h-12 rounded-full border-2 border-slate-800 border-b-[#FF006E] border-l-[#00D4FF] animate-[spin_1.5s_linear_infinite_reverse]" />
                
                {/* Core pulse */}
                <div className="absolute w-5 h-5 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] animate-pulse shadow-lg shadow-[#00D4FF]/50" />
            </div>

            <div className="mt-6 text-center space-y-2">
                <h3 className="font-orbitron font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-white to-[#7C3AED] tracking-widest uppercase animate-pulse">
                    AiRA LABS
                </h3>
                <p className="text-xs text-slate-400 font-mono tracking-wider">
                    Loading core components...
                </p>
            </div>
        </div>
    );
}
