import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layouts';
import { Home } from '../pages/Home';

function AppRoutes() {
	return (
		<Routes>
			<Route path='/' element={<MainLayout />}>
				<Route index element={<Home />} />

				{/* <Route path='book'>
					<Route path='all' element={<BrowseBooks />} />
					<Route path='detail/:id' element={<BookDetail />} />
				</Route> */}
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
