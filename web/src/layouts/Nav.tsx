import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
	AppBar,
	Avatar,
	Badge,
	Box,
	Button,
	CssBaseline,
	Drawer,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Menu,
	MenuItem,
	Stack,
	Toolbar,
	Tooltip,
	Typography,
	useTheme,
} from '@mui/material';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';

const drawerWidth = 240;

export function Nav() {
	const [mobileOpen, setMobileOpen] = React.useState(false);
	const theme = useTheme();
	const navigate = useNavigate();
	const { auth, logout } = useAuth();
	const isAdmin = !!auth?.user.isAdmin;

	const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

	const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	const handleDrawerToggle = () => {
		setMobileOpen(prevState => !prevState);
	};

	const drawer = (
		<Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
			<Toolbar />
			<List>
				<ListItem disablePadding>
					<ListItemButton sx={{ textAlign: 'center' }} onClick={() => navigate(isAdmin ? '/admin' : '/')}>
						<ListItemText primary='Home' />
					</ListItemButton>

					<ListItemButton
						sx={{ textAlign: 'center' }}
						onClick={() => navigate(isAdmin ? '/admin/books' : '/books')}>
						<ListItemText primary='Books' />
					</ListItemButton>
				</ListItem>
			</List>
		</Box>
	);

	return (
		<>
			<CssBaseline />
			<AppBar component='nav' sx={{ zIndex: theme.zIndex.drawer + 1, py: 0.5 }}>
				<Toolbar>
					<IconButton
						color='inherit'
						aria-label='open drawer'
						edge='start'
						onClick={handleDrawerToggle}
						sx={{ mr: 2, display: { sm: 'none' } }}>
						<MenuIcon />
					</IconButton>

					<Typography
						variant='h6'
						onClick={() => navigate('/')}
						sx={{ mr: 2, flexGrow: { xs: 1, sm: 0 }, cursor: 'pointer' }}>
						BookStore
					</Typography>

					<Box sx={{ display: { xs: 'none', sm: 'block' }, flexGrow: 1 }}>
						<Button sx={{ color: '#fff' }} onClick={() => navigate(isAdmin ? '/admin' : '/')}>
							Home
						</Button>

						<Button sx={{ color: '#fff' }} onClick={() => navigate(isAdmin ? '/admin/books' : '/books')}>
							Books
						</Button>
					</Box>

					<Stack sx={{ flexGrow: 0, flexDirection: 'row', gap: 2 }}>
						{!isAdmin && (
							<IconButton size='large' color='inherit' onClick={() => navigate('/cart')}>
								<Badge badgeContent={0} color='error'>
									<ShoppingCartIcon />
								</Badge>
							</IconButton>
						)}

						<Tooltip title={auth?.user.username || 'Login'}>
							<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
								<Avatar alt={auth?.user.username} src='/static/images/avatar/2.jpg' />
							</IconButton>
						</Tooltip>
						<Menu
							sx={{ mt: '45px' }}
							id='menu-appbar'
							anchorEl={anchorElUser}
							anchorOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							open={Boolean(anchorElUser)}
							onClose={handleCloseUserMenu}>
							{auth && [
								<MenuItem
									key='profile'
									onClick={() => {
										handleCloseUserMenu();
										navigate(auth.user.isAdmin ? '/admin/profile' : '/user/profile');
									}}>
									<Typography textAlign='center'>Profile</Typography>
								</MenuItem>,
								<MenuItem
									key='logout'
									onClick={() => {
										handleCloseUserMenu();
										logout();
									}}>
									<Typography textAlign='center'>Logout</Typography>
								</MenuItem>,
							]}

							{!auth && [
								<MenuItem
									key='login'
									onClick={() => {
										handleCloseUserMenu();
										navigate('/login');
									}}>
									<Typography textAlign='center'>Login</Typography>
								</MenuItem>,
								<MenuItem
									key='register'
									onClick={() => {
										handleCloseUserMenu();
										navigate('/register');
									}}>
									<Typography textAlign='center'>Register</Typography>
								</MenuItem>,
							]}
						</Menu>
					</Stack>
				</Toolbar>
			</AppBar>

			<Drawer
				component='nav'
				variant='temporary'
				open={mobileOpen}
				onClose={handleDrawerToggle}
				ModalProps={{
					keepMounted: true,
				}}
				sx={{
					display: { xs: 'block', sm: 'none' },
					'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
				}}>
				{drawer}
			</Drawer>
			<Toolbar sx={{ py: 0.5 }} />
		</>
	);
}
