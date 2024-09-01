import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { Checkbox, Tooltip } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useMemo, useState } from 'react';

interface PropsI {
	bookTitle: string;
}

export function WishlistBtn({ bookTitle }: PropsI) {
	const [checked, setChecked] = useState(false);

	const tooltipTitle = useMemo(() => (checked ? 'Remove from wishlist' : 'Add to wishlist'), [checked]);

	const handleClick = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
		setChecked(checked);
		const msg = checked ? `Added "${bookTitle}" to your wishlist` : `Removed "${bookTitle}" from your wishlist`;
		enqueueSnackbar(msg, { variant: 'success' });
	};

	return (
		<Tooltip title={tooltipTitle}>
			<Checkbox
				icon={<FavoriteBorder />}
				checkedIcon={<Favorite />}
				color='error'
				checked={checked}
				onChange={handleClick}
			/>
		</Tooltip>
	);
}
