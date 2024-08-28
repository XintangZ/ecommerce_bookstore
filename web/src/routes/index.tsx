import { Navigate, Route, Routes } from 'react-router-dom';
import { Redirect } from '../components/common/Redirect';
import { MainLayout } from '../layouts';
import { Home } from '../pages/Home';
import { Login } from '../pages/auth';
import { BookDetails, Books } from '../pages/client';
import { ProtectedRoute } from './ProtectedRoute';
import { Register } from '../pages/auth/Register/Register';

function AppRoutes() {
	return (
		<Routes>
			<Route path='/' element={<MainLayout />}>
				<Route index element={<Home />} />

				<Route path='books'>
					<Route index element={<Books />} />
					<Route path=':id' element={<BookDetails />} />
				</Route>

				<Route path='admin' element={<ProtectedRoute isAdminOnly={true} />}>
					<Route index element={<Home />} />
				</Route>

				<Route
					path='unauthorized'
					element={
						<Redirect
							msgType='warning'
							title='Access denied'
							msg='You do not have permission to view this page.'
						/>
					}
				/>

				<Route
					path='error'
					element={
						<Redirect
							msgType='error'
							title='An error occurred'
							msg='The server encountered an error while processing your request. Please try again later.'
						/>
					}
				/>

				<Route
					path='page-not-found'
					element={
						<Redirect
							msgType='info'
							title='Page not found'
							msg='The page you are looking for is not found.'
						/>
					}
				/>
			</Route>

			<Route path='login' element={<Login />} />
			<Route path='register' element={<Register />} />

			{/* <Route path='register'>
				<Route index element={<Register />} />
			</Route> */}

			<Route path='*' element={<Navigate to='/page-not-found' replace />} />
		</Routes>
	);
}

export default AppRoutes;
