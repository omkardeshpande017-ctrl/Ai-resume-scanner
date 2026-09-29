import { useState } from 'react';
import {
    UploadCloud,
    FileText,
    CheckCircle2
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Scan() {
    const [file, setFile] = useState(null);
    const [drag, setDrag] = useState(false);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');

    const nav = useNavigate();

    const choose = f => {
        setErr('');

        if (!f) return;

        if (
            ![
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ].includes(f.type)
        ) {
            setErr(
                'Only PDF and DOCX files are supported.'
            );
            return;
        }

        if (f.size > 5 * 1024 * 1024) {
            setErr('Maximum file size is 5 MB.');
            return;
        }

        setFile(f);
    };

    const upload = async () => {
        if (!file) return;

        setBusy(true);

        try {
            const fd = new FormData();
            fd.append('file', file);

            const r = await api.post(
                '/resume/upload',
                fd,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            nav(`/analysis/${r.data.id}`);
        } catch (e) {
            setErr(
                e.response?.data?.detail ||
                'Upload failed'
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <p className="text-sm font-semibold text-violet-400">
                    NEW SCAN
                </p>

                <h1 className="mt-2 text-4xl font-black">
                    Upload your resume
                </h1>

                <p className="mt-2 text-slate-400">
                    PDF or DOCX · maximum 5 MB · processed securely
                </p>
            </div>

            <div
                onDragOver={e => {
                    e.preventDefault();
                    setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => {
                    e.preventDefault();
                    setDrag(false);
                    choose(e.dataTransfer.files[0]);
                }}
                className={`glass grid min-h-[330px] place-items-center rounded-3xl border-2 border-dashed ${
                    drag
                        ? 'border-violet-400'
                        : 'border-slate-700'
                }`}
            >
                <div className="text-center">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-500/10">
                        <UploadCloud className="text-violet-400" />
                    </div>

                    <h2 className="mt-5 text-xl font-bold">
                        Drag & drop your resume
                    </h2>

                    <p className="mt-2 text-slate-500">
                        or choose a file from your device
                    </p>

                    <label className="btn gradient mt-5 inline-block cursor-pointer">
                        Choose file

                        <input
                            hidden
                            type="file"
                            accept=".pdf,.docx"
                            onChange={e =>
                                choose(e.target.files?.[0])
                            }
                        />
                    </label>

                    {file && (
                        <div className="mt-6 flex items-center gap-3 rounded-xl bg-slate-900 p-3 text-left">
                            <FileText
                                size={20}
                                className="text-violet-400"
                            />

                            <div>
                                <div className="font-semibold">
                                    {file.name}
                                </div>

                                <div className="text-xs text-slate-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                            </div>

                            <CheckCircle2 className="ml-auto text-emerald-400" />
                        </div>
                    )}

                    {err && (
                        <p className="mt-4 text-sm text-red-300">
                            {err}
                        </p>
                    )}

                    {file && (
                        <button
                            onClick={upload}
                            disabled={busy}
                            className="btn gradient mt-5 w-full"
                        >
                            {busy
                                ? 'Analyzing…'
                                : 'Upload & Analyze'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}