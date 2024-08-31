import { Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { LinkRouter } from '../components';

export function Banner() {
	return (
		<Stack alignItems='center' sx={{ pt: 1, backgroundColor: grey[300] }}>
			<Typography my={1} variant='body2'>
				Free Shipping on All Orders Over $100
				<LinkRouter to='/books' sx={{ ml: 2 }}>
					Shop Now
				</LinkRouter>
			</Typography>
		</Stack>
	);
}
