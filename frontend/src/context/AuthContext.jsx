import {
    createContext,
    useContext,
    useState
} from 'react';

import api from '../services/api';

const C = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        localStorage.getItem('resume_token')
    );

    const [user, setUser] = useState(null);

    const login = async (data) => {
        const r = await api.post('/auth/login', data);

        localStorage.setItem(
            'resume_token',
            r.data.token
        );

        setToken(r.data.token);
    };

    const register = async (data) => {
        const r = await api.post('/auth/register', data);

        localStorage.setItem(
            'resume_token',
            r.data.token
        );

        setToken(r.data.token);
    };

    const logout = () => {
        localStorage.removeItem('resume_token');
        setToken(null);
        setUser(null);
    };

    return (
        <C.Provider
            value={{
                token,
                user,
                login,
                register,
                logout
            }}
        >
            {children}
        </C.Provider>
    );
}

export const useAuth = () => useContext(C);