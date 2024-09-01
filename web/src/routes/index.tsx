import { Navigate, Route, Routes } from 'react-router-dom';
import { Redirect } from '../components/common/Redirect';
import { useAuth } from '../contexts';
import { MainLayout } from '../layouts';
import { AdminDashboard } from '../pages/admin';
import { BookForm } from '../pages/admin/Books/BookForm';
import { BookTable } from '../pages/admin/Books/BookTable';
import { Login } from '../pages/auth';
import { Register } from '../pages/auth/Register/Register';
import { BookDetails, Books, Home } from '../pages/client';
import { Orders } from '../pages/client/Orders/Orders';
import { ShoppingCart } from '../pages/client/ShoppingCart/ShoppingCart';
import { Checkout } from '../pages/client/Checkout/Checkout';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { Profile } from '../pages/client/Profile/Profile';
import { Wishlist } from '../pages/client/Profile/Wishlist';

function AppRoutes() {
	const { auth } = useAuth();
	const isAdmin = auth?.user.isAdmin;

	return (
		<Routes>
			<Route path='/' element={<MainLayout />}>
				<Route index element={isAdmin ? <AdminDashboard /> : <Home />} />

				<Route path='books'>
					<Route index element={isAdmin ? <BookTable /> : <Books />} />
					<Route path=':id' element={<BookDetails />} />

					<Route element={<ProtectedRoute isAdminOnly={true} />}>
						<Route path='create' element={<BookForm />} />
						<Route path='edit/:id' element={<BookForm />} />
					</Route>
				</Route>

				<Route path='orders' element={<ProtectedRoute isAdminOnly={false} />}>
					<Route index element={<Orders />} />
				</Route>

				<Route element={<ProtectedRoute isAdminOnly={false} />}>
					<Route path='profile' element={<Profile />} />
					<Route path='wishlist' element={<Wishlist />} />

				</Route>

				<Route path='cart'>
					<Route index element={<ShoppingCart />} />
					<Route path=':id' element={<BookDetails />} />

					<Route element={<ProtectedRoute isAdminOnly={false} />}>
						<Route path='checkout' element={<Checkout />} />
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
