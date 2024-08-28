import { Button, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { red } from '@mui/material/colors';
import { useMemo } from 'react';
import { LinkRouter } from '../../../components';
import { BookT } from '../../../types';

type PropsT = {
	book: BookT;
};

export function BookCard({ book }: PropsT) {
	const bookDetailUri = useMemo(() => `/books/${book._id}`, [book]);

	return (
		<Card sx={{ height: '100%' }} variant='outlined'>
			<LinkRouter to={bookDetailUri}>
				<CardMedia
					component='img'
					height='160'
					sx={{ pt: 2, objectFit: 'contain' }}
					image={book.coverImage || 'http://lgimages.s3.amazonaws.com/nc-md.gif'}
					alt={book.title}
				/>
			</LinkRouter>
			<CardContent>
				<LinkRouter variant='h5' noWrap underline='hover' to={bookDetailUri}>
					{book.title}
				</LinkRouter>
				<Typography variant='subtitle1' color='text.secondary' noWrap>
					{book.author}
				</Typography>
				<Typography variant='h6' color={red[600]}>
					${book.price.toFixed(2)}
				</Typography>

				<Button variant='contained' fullWidth disabled={!book.stock} sx={{ mt: 2 }}>
					{!!book.stock ? `Add to Cart` : 'Out of Stock'}
				</Button>
			</CardContent>
		</Card>
	);
}
