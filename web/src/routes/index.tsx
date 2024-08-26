import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layouts';
import { Home } from '../pages/Home';
import { BookDetails, Books } from '../pages/client';

function AppRoutes() {
	return (
		<Routes>
			<Route path='/' element={<MainLayout />}>
				<Route index element={<Home />} />

				<Route path='books'>
					<Route index element={<Books />} />
					<Route path=':id' element={<BookDetails />} />
				</Route>
			</Route>

			{/* <Route path='login' element={<Login />} /> */}

			{/* <Route path='register'>
				<Route index element={<Register />} />
			</Route> */}

			{/* <Route path='page-not-found' element={<NotFound />} /> */}
			{/* <Route path='*' element={<Navigate to='/page-not-found' replace />} /> */}
		</Routes>
	);
}

export default AppRoutes;
