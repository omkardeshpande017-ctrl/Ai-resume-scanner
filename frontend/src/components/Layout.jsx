import {
    Link,
    useLocation,
    useNavigate
} from 'react-router-dom';

import {
    FileSearch,
    LayoutDashboard,
    UploadCloud,
    LogOut,
    Sun,
    Moon
} from 'lucide-react';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const { logout } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();
    const [dark, setDark] = useState(true);

    return (
        <div className="min-h-screen">
            <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800/70 bg-slate-950/80 p-5 lg:block">
                <Link
                    to="/dashboard"
                    className="flex items-center gap-3 text-xl font-black"
                >
                    <span className="gradient grid h-10 w-10 place-items-center rounded-xl">
                        <FileSearch size={21} />
                    </span>
                    ResumeAI
                </Link>

                <nav className="mt-10 space-y-2">
                    {[
                        ["/dashboard", "Dashboard", LayoutDashboard],
                        ["/scan", "Scan Resume", UploadCloud]
                    ].map(([p, n, I]) => (
                        <Link
                            key={p}
                            to={p}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                                loc.pathname === p
                                    ? 'bg-white/10 text-white'
                                    : 'text-slate-400 hover:bg-white/5'
                            }`}
                        >
                            <I size={18} />
                            {n}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-5 left-5 right-5 space-y-2">
                    <button
                        onClick={() => setDark(!dark)}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-400 hover:bg-white/5"
                    >
                        {dark ? <Sun size={18} /> : <Moon size={18} />}
                        Theme
                    </button>

                    <button
                        onClick={() => {
                            logout();
                            nav('/');
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-400 hover:bg-white/5"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="min-h-screen lg:ml-64">
                <div className="mx-auto max-w-7xl p-5 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}