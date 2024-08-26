import { Button, Card, CardActionArea, CardContent, CardMedia, Link, Typography } from '@mui/material';
import { red } from '@mui/material/colors';
import { useMemo } from 'react';
import { BookT } from '../../../types';

type PropsT = {
	book: BookT;
};

export function BookCard({ book }: PropsT) {
	const bookDetailUri = useMemo(() => `/books/${book._id}`, [book]);

	return (
		<Card sx={{ height: '100%' }} variant='outlined'>
			<CardActionArea href={bookDetailUri}>
				{book.coverImage && <CardMedia component='img' height='140' image={book.coverImage} alt={book.title} />}
			</CardActionArea>
			<CardContent>
				<Link variant='h5' noWrap underline='hover' href={bookDetailUri}>
					{book.title}
				</Link>
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
