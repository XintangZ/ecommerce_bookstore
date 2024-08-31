import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import { Container, Fab, Stack } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts';
import { Banner } from './Banner';
import { Footer } from './Footer';
import { Nav } from './Nav';

export function MainLayout() {
	const { auth } = useAuth();
	const { pathname } = useLocation();

	return (
		<Stack height={'100vh'}>
			<Nav />
			{pathname === '/' && !auth?.user.isAdmin && <Banner />}

			<Stack sx={{ flexGrow: 1, overflow: 'auto' }}>
				<Container sx={{ flexGrow: 1, py: 3 }}>
					<Outlet />

					{!auth?.user.isAdmin && (
						<Fab color='secondary' aria-label='support' sx={{ position: 'fixed', bottom: 80, right: 20 }}>
							<ContactSupportIcon fontSize='large' />
						</Fab>
					)}
				</Container>

				<Footer />
			</Stack>
		</Stack>
	);
}
