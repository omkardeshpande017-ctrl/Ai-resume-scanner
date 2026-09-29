export default function ScoreRing({ value, label }) {
    return (
        <div className="flex flex-col items-center">
            <div
                className="relative grid h-28 w-28 place-items-center rounded-full"
                style={{
                    background: `conic-gradient(
                        #7c3aed ${value * 3.6}deg,
                        #1e293b 0deg
                    )`
                }}
            >
                <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-950 text-2xl font-black">
                    {value}
                </div>
            </div>

            <span className="mt-2 text-sm text-slate-400">
                {label}
            </span>
        </div>
    );
}