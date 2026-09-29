import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import {
    AuthProvider,
    useAuth
} from './context/AuthContext';

import Layout from './components/Layout';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import Analysis from './pages/Analysis';

function Protected({ children }) {
    const { token } = useAuth();

    return token ? (
        <Layout>
            {children}
        </Layout>
    ) : (
        <Navigate
            to="/login"
            replace
        />
    );
}

function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={<Landing />}
            />

            <Route
                path="/login"
                element={<Auth />}
            />

            <Route
                path="/register"
                element={<Auth mode="register" />}
            />

            <Route
                path="/dashboard"
                element={
                    <Protected>
                        <Dashboard />
                    </Protected>
                }
            />

            <Route
                path="/scan"
                element={
                    <Protected>
                        <Scan />
                    </Protected>
                }
            />

            <Route
                path="/analysis/:id"
                element={
                    <Protected>
                        <Analysis />
                    </Protected>
                }
            />

            <Route
                path="*"
                element={<Navigate to="/" />}
            />
        </Routes>
    );
}

export default function Root() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    );
}