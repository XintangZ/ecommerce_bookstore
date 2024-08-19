import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Nav } from './Nav';

export function MainLayout() {
	return (
		<div>
			<Nav />
			<Outlet />
			<Footer />
		</div>
	);
}
