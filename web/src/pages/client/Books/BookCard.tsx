import { Button, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { red } from '@mui/material/colors';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { LinkRouter } from '../../../components';
import { DEFAULT_COVER_IMG } from '../../../consts';
import { useAuth, useCart } from '../../../contexts';
import { BookT } from '../../../types';
import { useGetUser, useUpdateWishlist } from '../../../services';
import FavoriteIcon from '@mui/icons-material/Favorite';

type PropsT = {
	book: BookT;
};

export function BookCard({ book }: PropsT) {
	const { auth } = useAuth();
	const { addToCartAndUpdateServer } = useCart();
	const [wishlist, setWishlist] = useState<string[]>([]);
	const { data: userData } = useGetUser(auth?.token as string);
	const updateListMutation = useUpdateWishlist(auth?.token as string);
	const bookDetailUri = useMemo(() => `/books/${book._id}`, [book]);
	const bookImg = `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;

	useEffect(() => {
    if (userData) {
      setWishlist(userData.data.wishlist || []);
    }
  }, [userData]);

	const handleAddToCart = async () => {
		addToCartAndUpdateServer(book);
		enqueueSnackbar({
			message: `"${book.title}" added to cart`,
			variant: 'success',
		});
	};

  const handleAddToWishlist = async () => {
    if (!wishlist.includes(book._id)) {
      // Create a new wishlist array with the new book ID
      const updatedWishlist = [...wishlist, book._id];

      // Update the wishlist on the server
      try {
        await updateListMutation.mutateAsync({
          wishlist: updatedWishlist,
        });
        // Update the wishlist state
        setWishlist(updatedWishlist);

        enqueueSnackbar({
          message: `"${book.title}" added to wishlist`,
          variant: 'success',
        });
      } catch (error) {
        console.error("Failed to update wishlist", error);
      }
    }
  };

	return (
		<Card sx={{ height: '100%' }} variant='outlined'>
			<LinkRouter to={bookDetailUri}>
				<CardMedia
					component='img'
					height='160'
					sx={{ pt: 2, objectFit: 'contain' }}
					image={bookImg || DEFAULT_COVER_IMG}
					alt={book.title}
				/>
			</LinkRouter>
			<CardContent>
				<LinkRouter underline='hover' to={bookDetailUri}>
					<Typography variant='h5' noWrap>
						{book.title}
					</Typography>
				</LinkRouter>

				<Typography variant='subtitle1' color='text.secondary' noWrap>
					{book.author}
				</Typography>

				<Typography variant='h6' color={red[600]}>
					${book.price.toFixed(2)}
				</Typography>

				<Button variant='contained' fullWidth disabled={!book.stock} sx={{ mt: 2 }} onClick={handleAddToCart}>
					{!!book.stock ? `Add to Cart` : 'Out of Stock'}
				</Button>
				<Button variant='contained' color="success" fullWidth disabled={wishlist.includes(book._id)} sx={{ mt: 2 }} onClick={handleAddToWishlist} endIcon={<FavoriteIcon />}>
					{!wishlist.includes(book._id) ? `Add to Wishlist` : 'Already in wishlist'}
				</Button>
			</CardContent>
		</Card>
	);
}