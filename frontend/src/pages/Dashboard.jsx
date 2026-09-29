import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    FileSearch,
    ArrowUpRight,
    Plus,
    Trash2
} from 'lucide-react';

import api from '../services/api';
import ScoreRing from '../components/ScoreRing';

export default function Dashboard() {
    const [d, setD] = useState(null);
    const [resumes, setResumes] = useState([]);

    const load = async () => {
        const [a, b] = await Promise.all([
            api.get('/dashboard'),
            api.get('/resume')
        ]);

        setD(a.data);
        setResumes(b.data);
    };

    useEffect(() => {
        load();
    }, []);

    const del = async id => {
        if (!confirm('Delete this resume?')) return;

        await api.delete(`/resume/${id}`);
        load();
    };

    if (!d) {
        return (
            <div className="p-10 text-slate-400">
                Loading dashboard…
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-violet-400">
                        OVERVIEW
                    </p>

                    <h1 className="mt-2 text-4xl font-black">
                        Resume command center
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Track scores, skill gaps and your recent scans.
                    </p>
                </div>

                <Link
                    to="/scan"
                    className="btn gradient flex items-center gap-2"
                >
                    <Plus size={18} />
                    New scan
                </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass card">
                    <div className="muted text-sm">
                        Resume scans
                    </div>

                    <div className="mt-3 text-3xl font-black">
                        {d.resume_count}
                    </div>
                </div>

                <div className="glass card">
                    <div className="muted text-sm">
                        Job matches
                    </div>

                    <div className="mt-3 text-3xl font-black">
                        {d.job_match_count}
                    </div>
                </div>

                <div className="glass card">
                    <div className="muted text-sm">
                        Latest score
                    </div>

                    <div className="mt-3 text-3xl font-black">
                        {d.latest?.score || '—'}
                        <span className="text-sm text-slate-500">
                            /100
                        </span>
                    </div>
                </div>

                <div className="glass card">
                    <div className="muted text-sm">
                        Latest ATS
                    </div>

                    <div className="mt-3 text-3xl font-black">
                        {d.latest?.ats || '—'}
                        <span className="text-sm text-slate-500">
                            /100
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="glass card lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold">
                            Recent resumes
                        </h2>

                        <Link
                            to="/scan"
                            className="text-sm text-violet-400"
                        >
                            Scan another
                        </Link>
                    </div>

                    <div className="mt-4 space-y-3">
                        {resumes.length ? (
                            resumes.map(r => (
                                <div
                                    key={r.id}
                                    className="flex items-center gap-4 rounded-xl bg-slate-900/70 p-4"
                                >
                                    <FileSearch className="text-violet-400" />

                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-semibold">
                                            {r.filename}
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            Score {r.score} · ATS{' '}
                                            {r.ats_score}
                                        </div>
                                    </div>

                                    <Link
                                        to={`/analysis/${r.id}`}
                                        className="rounded-lg p-2 hover:bg-white/5"
                                    >
                                        <ArrowUpRight size={18} />
                                    </Link>

                                    <button
                                        onClick={() => del(r.id)}
                                        className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-300"
                                    >
                                        <Trash2 size={17} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center text-slate-500">
                                No scans yet.
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass card flex flex-col items-center justify-center">
                    <ScoreRing
                        value={d.latest?.score || 0}
                        label="Latest Resume Score"
                    />

                    <p className="mt-5 text-center text-sm text-slate-500">
                        Scores are generated from extracted content and
                        machine-checkable ATS signals.
                    </p>
                </div>
            </div>
        </div>
    );
}