import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts';

interface PropsI {
	// element: ReactElement;
	isAdminOnly: boolean;
	// allowedRoles: string[];
}

export function ProtectedRoute({ isAdminOnly }: PropsI) {
	const { auth } = useAuth();

	if (!auth) {
		return <Navigate to='/login' replace />;
	}

	// if (!allowedRoles.includes(auth.user.role)) {
	// 	return <Navigate to='/unauthorized' replace />;
	// }

	if (isAdminOnly && !auth.user.isAdmin) {
		return <Navigate to='/unauthorized' replace />;
	}

	return <Outlet />;
}
