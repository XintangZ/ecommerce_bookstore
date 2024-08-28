import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts';

export function GuestRoute() {
	const { auth } = useAuth();

	if (auth) {
		return <Navigate to='/' replace />;
	}

	return <Outlet />;
}
