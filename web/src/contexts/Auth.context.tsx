import { enqueueSnackbar } from 'notistack';
import { ReactNode, createContext, useContext, useState } from 'react';
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
	const token = localStorage.getItem('token');
	const user = localStorage.getItem('user');

	let currAuth = null;
	if (token && user) {
		currAuth = {
			user: JSON.parse(user),
			token,
		};
	}

	const [auth, setAuth] = useState<LoginResT | null>(currAuth);
	const navigate = useNavigate();

	const login = (loginRes: LoginResT) => {
		setAuth(loginRes);

		const { token, user } = loginRes;
		localStorage.setItem('token', token);
		localStorage.setItem('user', JSON.stringify(user));

		user.isAdmin ? navigate('/admin') : navigate(-1);

		enqueueSnackbar(`Welcome, ${user.username}`, {
			variant: 'success',
			hideIconVariant: true,
		});
	};

	const logout = () => {
		setAuth(null);
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		navigate('/', { replace: true });

		enqueueSnackbar('You are logged out', { variant: 'default' });
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
