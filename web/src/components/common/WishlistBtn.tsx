import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import { Checkbox, Tooltip } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { useMemo } from 'react';
import { useAuth } from '../../contexts';
import { useGetUser, useUpdateWishlist } from '../../services';

interface PropsI {
	bookTitle: string;
	bookId: string;
}

export function WishlistBtn({ bookTitle, bookId }: PropsI) {
	const { auth } = useAuth();
	const { data: userData } = useGetUser(auth?.token as string);
	const updateListMutation = useUpdateWishlist(auth?.token as string);
	const queryClient = useQueryClient();

	const wishlist = useMemo(() => userData?.data?.wishlist || ([] as string[]), [userData]);

	const isAlreadyAdded = useMemo(() => wishlist.includes(bookId), [bookId, wishlist]);

	const tooltipTitle = useMemo(() => (isAlreadyAdded ? 'Remove from wishlist' : 'Add to wishlist'), [isAlreadyAdded]);

	const handleAddToWishlist = async () => {
		let updatedWishlist;

		if (isAlreadyAdded) {
			// Remove the book ID from the wishlist array
			updatedWishlist = wishlist.filter(id => id !== bookId);
		} else {
			// Create a new wishlist array with the new book ID
			updatedWishlist = [...wishlist, bookId];
		}
		// Update the wishlist on the server
		try {
			await updateListMutation.mutateAsync({
				wishlist: updatedWishlist,
			});

			queryClient.invalidateQueries({ queryKey: ['user', auth?.token] });

			const msg = isAlreadyAdded
				? `Removed "${bookTitle}" from your wishlist`
				: `Added "${bookTitle}" to your wishlist`;
			enqueueSnackbar(msg, { variant: 'success' });
		} catch (error) {
			console.error('Failed to update wishlist', error);
			enqueueSnackbar(`Failed to update wishlist`, { variant: 'error' });
		}
	};

	return (
		<Tooltip title={tooltipTitle}>
			<Checkbox
				icon={<FavoriteBorder />}
				checkedIcon={<Favorite />}
				color='error'
				checked={isAlreadyAdded}
				onChange={handleAddToWishlist}
				disabled={updateListMutation.isPending}
			/>
		</Tooltip>
	);
}
