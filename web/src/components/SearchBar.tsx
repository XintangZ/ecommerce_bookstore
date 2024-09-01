import SearchIcon from '@mui/icons-material/Search';
import { Drawer, IconButton, Stack, Toolbar, useMediaQuery } from '@mui/material';
import InputBase from '@mui/material/InputBase';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { useState } from 'react';

const Search = styled('form')(({ theme }) => ({
	position: 'relative',
	borderRadius: theme.shape.borderRadius,
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	'&:hover': {
		backgroundColor: alpha(theme.palette.common.white, 0.25),
	},
	width: '100%',
	[theme.breakpoints.up('sm')]: {
		margin: theme.spacing(1, 2),
		width: 'auto',
	},
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
	padding: theme.spacing(0, 2),
	height: '100%',
	position: 'absolute',
	pointerEvents: 'none',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: 'inherit',
	width: '100%',
	'& .MuiInputBase-input': {
		padding: theme.spacing(1, 1, 1, 0),
		// vertical padding + font size from searchIcon
		paddingLeft: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create('width'),
		[theme.breakpoints.up('md')]: {
			width: 240,
			'&:focus': {
				width: 320,
			},
		},
	},
}));

export function SearchBar() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));

	const [open, setOpen] = useState(false);

	const searchBar = (
		<Search action='/books'>
			<SearchIconWrapper>
				<SearchIcon />
			</SearchIconWrapper>
			<StyledInputBase
				placeholder='Search by title, author, or ISBN'
				inputProps={{ 'aria-label': 'search' }}
				name='search'
			/>
		</Search>
	);

	return isMobile ? (
		<>
			<IconButton size='large' color='inherit' onClick={() => setOpen(!open)}>
				<SearchIcon />
			</IconButton>

			<Drawer anchor='top' open={open} onClose={() => setOpen(false)}>
				<Toolbar />
				<Stack mt={2} mb={1}>
					{searchBar}
				</Stack>
			</Drawer>
		</>
	) : (
		searchBar
	);
}
