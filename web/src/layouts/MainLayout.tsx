import { Container, Stack } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Nav } from './Nav';

export function MainLayout() {
	return (
		<Stack height={'100vh'}>
			<Nav />

			<Stack sx={{ flexGrow: 1, overflow: 'auto' }}>
				<Container maxWidth='xl' sx={{ flexGrow: 1, py: 3 }}>
					<Outlet />
				</Container>

				<Footer />
			</Stack>
		</Stack>
	);
}
