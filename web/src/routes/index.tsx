import { Navigate, Route, Routes } from 'react-router-dom';
import { Redirect } from '../components/common/Redirect';
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
							msgType='error'
							title='Page Not Found'
							msg='The page you are looking for is not found.'
						/>
					}
				/>
				<Route path='*' element={<Navigate to='/page-not-found' replace />} />
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
