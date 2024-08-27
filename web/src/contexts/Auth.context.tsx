import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginResT } from '../types';

interface AuthContextI {
	auth: LoginResT | null;
	login: (loginRes: LoginResT) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextI | undefined>(undefined);

interface AuthProviderPropsI {
	children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderPropsI) => {
	const [auth, setAuth] = useState<LoginResT | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem('token');
		const user = localStorage.getItem('user');

		if (user && token) {
			setAuth({
				user: JSON.parse(user),
				token,
			});
		}
	}, []);

	const login = (loginRes: LoginResT) => {
		setAuth(loginRes);

		const { token, user } = loginRes;
		localStorage.setItem('token', token);
		localStorage.setItem('user', JSON.stringify(user));

		navigate(-1);
	};

	const logout = () => {
		setAuth(null);
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		navigate('/', { replace: true });
	};

	return <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>;
};

const useAuth = (): AuthContextI => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export { AuthProvider, useAuth };
