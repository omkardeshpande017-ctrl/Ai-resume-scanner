import { Link } from 'react-router-dom';

import {
    ArrowRight,
    BrainCircuit,
    ShieldCheck,
    Target,
    SearchCheck,
    Sparkles
} from 'lucide-react';

export default function Landing() {
    return (
        <div className="min-h-screen">
            <header className="mx-auto flex max-w-7xl items-center justify-between p-6">
                <div className="flex items-center gap-3 text-xl font-black">
                    <span className="gradient grid h-10 w-10 place-items-center rounded-xl">
                        <SearchCheck size={21} />
                    </span>
                    ResumeAI
                </div>

                <div className="flex gap-3">
                    <Link
                        to="/login"
                        className="btn text-slate-300"
                    >
                        Log in
                    </Link>

                    <Link
                        to="/register"
                        className="btn gradient"
                    >
                        Get started
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 text-center">
                <span className="pill text-violet-300">
                    AI + ATS + Job Matching
                </span>

                <h1 className="mt-6 text-5xl font-black tracking-tight md:text-7xl">
                    Scan Your Resume.
                    <br />
                    <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                        Improve Your Career.
                    </span>
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
                    Turn a PDF or DOCX resume into actionable ATS insights,
                    skill gaps, and job-specific recommendations without
                    inventing achievements.
                </p>

                <Link
                    to="/register"
                    className="btn gradient mt-8 inline-flex items-center gap-2"
                >
                    Scan My Resume
                    <ArrowRight size={18} />
                </Link>

                <div className="mt-20 grid gap-4 md:grid-cols-5">
                    {[
                        [BrainCircuit, 'AI Resume Scanner'],
                        [ShieldCheck, 'ATS Analysis'],
                        [Target, 'Job Match'],
                        [Sparkles, 'Skill Gap Detection'],
                        [SearchCheck, 'AI Recommendations']
                    ].map(([I, t]) => (
                        <div
                            className="glass card text-left"
                            key={t}
                        >
                            <I className="text-violet-400" />

                            <h3 className="mt-5 font-bold">
                                {t}
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Grounded analysis with practical next steps.
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}