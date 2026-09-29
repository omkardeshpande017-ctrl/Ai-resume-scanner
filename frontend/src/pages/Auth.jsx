import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function Auth({ mode = 'login' }) {
    const reg = mode === 'register';

    const { login, register } = useAuth();
    const nav = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);

    const submit = async e => {
        e.preventDefault();
        setBusy(true);
        setErr('');

        try {
            reg
                ? await register(form)
                : await login({
                    email: form.email,
                    password: form.password
                });

            nav('/dashboard');
        } catch (x) {
            setErr(
                x.response?.data?.detail ||
                'Something went wrong'
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="grid min-h-screen place-items-center p-6">
            <form
                onSubmit={submit}
                className="glass card w-full max-w-md"
            >
                <h1 className="text-3xl font-black">
                    {reg ? 'Create account' : 'Welcome back'}
                </h1>

                <p className="mt-2 text-slate-400">
                    {reg
                        ? 'Start scanning resumes in minutes.'
                        : 'Continue your resume analysis.'}
                </p>

                {reg && (
                    <input
                        required
                        minLength="2"
                        className="mt-7 w-full rounded-xl bg-slate-900 p-3 outline-none ring-violet-500 focus:ring-2"
                        placeholder="Full name"
                        value={form.name}
                        onChange={e =>
                            setForm({
                                ...form,
                                name: e.target.value
                            })
                        }
                    />
                )}

                <input
                    required
                    type="email"
                    className="mt-4 w-full rounded-xl bg-slate-900 p-3 outline-none ring-violet-500 focus:ring-2"
                    placeholder="Email"
                    value={form.email}
                    onChange={e =>
                        setForm({
                            ...form,
                            email: e.target.value
                        })
                    }
                />

                <input
                    required
                    minLength="8"
                    type="password"
                    className="mt-4 w-full rounded-xl bg-slate-900 p-3 outline-none ring-violet-500 focus:ring-2"
                    placeholder="Password (8+ characters)"
                    value={form.password}
                    onChange={e =>
                        setForm({
                            ...form,
                            password: e.target.value
                        })
                    }
                />

                {err && (
                    <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                        {err}
                    </p>
                )}

                <button
                    disabled={busy}
                    className="btn gradient mt-5 w-full"
                >
                    {busy
                        ? 'Please wait…'
                        : reg
                            ? 'Create account'
                            : 'Log in'}
                </button>

                <p className="mt-5 text-center text-sm text-slate-500">
                    {reg
                        ? 'Already have an account? '
                        : 'New here? '}

                    <Link
                        className="text-violet-400"
                        to={reg ? '/login' : '/register'}
                    >
                        {reg ? 'Log in' : 'Create account'}
                    </Link>
                </p>
            </form>
        </div>
    );
}