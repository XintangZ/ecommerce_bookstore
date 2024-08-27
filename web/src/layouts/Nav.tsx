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

const drawerWidth = 240;
const navItems = [
	{ page: 'Home', uri: '/' },
	{ page: 'Books', uri: '/books' },
];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

export function Nav() {
	const [mobileOpen, setMobileOpen] = React.useState(false);
	const theme = useTheme();
	const navigate = useNavigate();

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
				{navItems.map((item, index) => (
					<ListItem key={index} disablePadding>
						<ListItemButton sx={{ textAlign: 'center' }} onClick={() => navigate(item.uri)}>
							<ListItemText primary={item.page} />
						</ListItemButton>
					</ListItem>
				))}
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
						{navItems.map((item, index) => (
							<Button key={index} sx={{ color: '#fff' }} onClick={() => navigate(item.uri)}>
								{item.page}
							</Button>
						))}
					</Box>

					<Stack sx={{ flexGrow: 0, flexDirection: 'row', gap: 2 }}>
						<IconButton size='large' aria-label='show 4 new mails' color='inherit'>
							<Badge badgeContent={4} color='error'>
								<ShoppingCartIcon />
							</Badge>
						</IconButton>

						<Tooltip title='Open settings'>
							<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
								<Avatar alt='Remy Sharp' src='/static/images/avatar/2.jpg' />
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
							{settings.map(setting => (
								<MenuItem key={setting} onClick={handleCloseUserMenu}>
									<Typography textAlign='center'>{setting}</Typography>
								</MenuItem>
							))}
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
