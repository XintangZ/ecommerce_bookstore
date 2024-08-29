import { Navigate, Route, Routes } from 'react-router-dom';
import { Redirect } from '../components/common/Redirect';
import { MainLayout } from '../layouts';
import { AdminDashboard } from '../pages/admin';
import { BookForm } from '../pages/admin/Books/BookForm';
import { BookTable } from '../pages/admin/Books/BookTable';
import { Login } from '../pages/auth';
import { Register } from '../pages/auth/Register/Register';
import { BookDetails, Books, Home } from '../pages/client';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { Orders } from '../pages/client/Orders/Orders';

function AppRoutes() {
	return (
		<Routes>
			<Route path='/' element={<MainLayout />}>
				<Route index element={<Home />} />

				<Route path='books'>
					<Route index element={<Books />} />
					<Route path=':id' element={<BookDetails />} />
				</Route>

				<Route path='orders'>
					<Route index element={<Orders />} />
					
				</Route>

				<Route path='admin' element={<ProtectedRoute isAdminOnly={true} />}>
					<Route index element={<AdminDashboard />} />

					<Route path='books'>
						<Route index element={<BookTable />} />
						<Route path='create' element={<BookForm />} />
						<Route path='edit/:id' element={<BookForm />} />
					</Route>
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

			<Route path='/' element={<GuestRoute />}>
				<Route path='login' element={<Login />} />
				<Route path='register' element={<Register />} />
			</Route>

			<Route path='*' element={<Navigate to='/page-not-found' replace />} />
		</Routes>
	);
}

export default AppRoutes;
