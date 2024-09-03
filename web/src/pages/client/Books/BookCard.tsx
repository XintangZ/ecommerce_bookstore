import { Button, Card, CardContent, CardMedia, Stack, Typography } from '@mui/material';
import { red } from '@mui/material/colors';
import { enqueueSnackbar } from 'notistack';
import { useMemo } from 'react';
import { LinkRouter, WishlistBtn } from '../../../components';
import { DEFAULT_COVER_IMG } from '../../../consts';
import { useAuth, useCart } from '../../../contexts';
import { BookT } from '../../../types';

type PropsT = {
	book: BookT;
};

export function BookCard({ book }: PropsT) {
	const { auth } = useAuth();
	const { addToCartAndUpdateServer } = useCart();
	const bookDetailUri = useMemo(() => `/books/${book._id}`, [book]);
	const bookImg = `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`;

	const handleAddToCart = async () => {
		addToCartAndUpdateServer(book);
		enqueueSnackbar({
			message: `"${book.title}" added to cart`,
			variant: 'success',
		});
	};

	return (
		<Card sx={{ height: '100%', position: 'relative' }} variant='outlined'>
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

				{auth && (
					<Stack sx={{ position: 'absolute', right: 6, top: 6 }}>
						<WishlistBtn bookTitle={book.title} bookId={book._id} />
					</Stack>
				)}
			</CardContent>
		</Card>
	);
}
