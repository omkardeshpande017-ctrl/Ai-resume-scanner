import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import api from '../services/api';
import ScoreRing from '../components/ScoreRing';

const tabs = [
    'Overview',
    'ATS Analysis',
    'Skills',
    'Job Match',
    'Experience',
    'Education',
    'Projects',
    'Suggestions'
];

export default function Analysis() {
    const { id } = useParams();

    const [d, setD] = useState(null);
    const [tab, setTab] = useState('Overview');
    const [job, setJob] = useState('');
    const [match, setMatch] = useState(null);
    const [err, setErr] = useState('');

    useEffect(() => {
        api.get(`/resume/${id}`)
            .then(r => setD(r.data))
            .catch(e =>
                setErr(
                    e.response?.data?.detail ||
                    'Unable to load analysis'
                )
            );
    }, [id]);

    if (err) {
        return (
            <div className="text-red-300">
                {err}
            </div>
        );
    }

    if (!d) {
        return (
            <div className="text-slate-400">
                Loading analysis…
            </div>
        );
    }

    const a = d.analysis;

    const content = () => {
        if (tab === 'Overview') {
            return (
                <>
                    <div className="grid gap-5 md:grid-cols-3">
                        <div className="glass card flex items-center justify-center md:col-span-1">
                            <ScoreRing
                                value={a.overall}
                                label="Overall score"
                            />
                        </div>

                        <div className="glass card md:col-span-2">
                            <h2 className="font-bold">
                                Score breakdown
                            </h2>

                            <div className="mt-5 grid grid-cols-2 gap-4">
                                {[
                                    [a.ats, 'ATS'],
                                    [a.skills, 'Skills'],
                                    [a.experience, 'Experience'],
                                    [a.education, 'Education'],
                                    [a.projects, 'Projects'],
                                    [a.keywords, 'Keywords'],
                                    [a.completeness, 'Completeness'],
                                    [a.formatting, 'Formatting']
                                ].map(([v, n]) => (
                                    <div key={n}>
                                        <div className="flex justify-between text-sm">
                                            <span>{n}</span>
                                            <span>{v}</span>
                                        </div>

                                        <div className="mt-2 h-2 rounded-full bg-slate-800">
                                            <div
                                                className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                                                style={{
                                                    width: `${v}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="glass card mt-5">
                        <h2 className="font-bold">
                            Why these scores?
                        </h2>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {Object.entries(a.explanations).map(
                                ([k, v]) => (
                                    <div
                                        className="rounded-xl bg-slate-900/70 p-4"
                                        key={k}
                                    >
                                        <div className="font-semibold capitalize">
                                            {k}
                                        </div>

                                        <div className="mt-1 text-sm text-slate-500">
                                            {v}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </>
            );
        }

        if (tab === 'ATS Analysis') {
            return (
                <div className="glass card">
                    <h2 className="text-xl font-bold">
                        ATS checks
                    </h2>

                    <div className="mt-4 space-y-3">
                        {a.checks.map(c => (
                            <div
                                className="flex gap-4 rounded-xl bg-slate-900/70 p-4"
                                key={c.name}
                            >
                                <div
                                    className={
                                        c.passed
                                            ? 'text-emerald-400'
                                            : 'text-amber-300'
                                    }
                                >
                                    {c.passed ? '✓' : '!'}
                                </div>

                                <div>
                                    <div className="font-semibold">
                                        {c.name}
                                    </div>

                                    <div className="text-sm text-slate-500">
                                        {c.recommendation}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (tab === 'Skills') {
            return (
                <div className="grid gap-5 md:grid-cols-2">
                    {Object.entries(d.skills || {}).map(
                        ([g, vals]) => (
                            <div
                                className="glass card"
                                key={g}
                            >
                                <h3 className="font-bold">
                                    {g}
                                </h3>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {vals.length ? (
                                        vals.map(v => (
                                            <span
                                                className="pill text-violet-200"
                                                key={v}
                                            >
                                                {v}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-slate-500">
                                            None detected
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </div>
            );
        }

        if (tab === 'Job Match') {
            return (
                <div>
                    <div className="glass card">
                        <h2 className="text-xl font-bold">
                            Compare with a job description
                        </h2>

                        <textarea
                            value={job}
                            onChange={e => setJob(e.target.value)}
                            className="mt-4 min-h-48 w-full rounded-xl bg-slate-900 p-4 outline-none ring-violet-500 focus:ring-2"
                            placeholder="Paste the job description here…"
                        />

                        <button
                            onClick={async () => {
                                setErr('');

                                try {
                                    const r = await api.post(
                                        `/resume/${id}/job-match`,
                                        {
                                            jobDescription: job
                                        }
                                    );

                                    setMatch(r.data);
                                } catch (e) {
                                    setErr(
                                        e.response?.data?.detail ||
                                        'Job matching failed'
                                    );
                                }
                            }}
                            className="btn gradient mt-4"
                        >
                            Analyze job match
                        </button>

                        {err && (
                            <p className="mt-3 text-sm text-red-300">
                                {err}
                            </p>
                        )}
                    </div>

                    {match && (
                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                            <div className="glass card flex items-center justify-center">
                                <ScoreRing
                                    value={match.match_score}
                                    label="Job match"
                                />
                            </div>

                            <div className="glass card">
                                <h3 className="font-bold">
                                    Skills
                                </h3>

                                <p className="mt-3 text-sm text-emerald-300">
                                    Matching:{' '}
                                    {match.matching_skills.join(', ') ||
                                        'None detected'}
                                </p>

                                <p className="mt-3 text-sm text-amber-300">
                                    Missing:{' '}
                                    {match.missing_skills.join(', ') ||
                                        'None detected'}
                                </p>
                            </div>

                            <div className="glass card">
                                <h3 className="font-bold">
                                    Keywords found
                                </h3>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {match.keywords_found.map(x => (
                                        <span
                                            className="pill"
                                            key={x}
                                        >
                                            {x}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="glass card">
                                <h3 className="font-bold">
                                    Keywords missing
                                </h3>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {match.keywords_missing.map(x => (
                                        <span
                                            className="pill text-amber-200"
                                            key={x}
                                        >
                                            {x}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="glass card md:col-span-2">
                                <h3 className="font-bold">
                                    Method
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    {match.method}.{' '}
                                    {match.ai?.llm_used
                                        ? 'An external LLM also generated grounded recommendations.'
                                        : 'No external LLM was used; this result is from local analysis.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (
            ['Experience', 'Education', 'Projects'].includes(tab)
        ) {
            const key = tab.toLowerCase();

            return (
                <div className="glass card">
                    <h2 className="text-xl font-bold">
                        {tab}
                    </h2>

                    <pre className="mt-5 whitespace-pre-wrap font-sans leading-7 text-slate-400">
                        {d.parsed_data?.sections?.[key] ||
                            d.parsed_data?.sections?.[
                                tab === 'Experience'
                                    ? 'work experience'
                                    : key
                            ] ||
                            'No dedicated section was detected.'}
                    </pre>
                </div>
            );
        }

        return (
            <div className="glass card">
                <h2 className="text-xl font-bold">
                    Practical improvements
                </h2>

                <div className="mt-5 space-y-3">
                    {d.recommendations?.map((r, i) => (
                        <div
                            className="rounded-xl bg-slate-900/70 p-4"
                            key={i}
                        >
                            <span className="mr-3 text-violet-400">
                                0{i + 1}
                            </span>
                            {r}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="mb-6">
                <p className="text-sm text-violet-400">
                    ANALYSIS
                </p>

                <h1 className="mt-2 text-3xl font-black">
                    {d.filename}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Analysis engine: {d.ai?.provider || 'local'}
                </p>
            </div>

            <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
                {tabs.map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm ${
                            tab === t
                                ? 'bg-violet-500 text-white'
                                : 'bg-slate-900 text-slate-400'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {content()}
        </div>
    );
}