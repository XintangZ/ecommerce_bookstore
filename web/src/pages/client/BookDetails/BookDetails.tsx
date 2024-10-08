import { Breadcrumbs, Button, CardMedia, Divider, Grid, Stack, Typography } from '@mui/material';
import { red } from '@mui/material/colors';
import { enqueueSnackbar } from 'notistack';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { LinkRouter, Loading, WishlistBtn } from '../../../components';
import { DEFAULT_COVER_IMG } from '../../../consts';
import { useAuth, useCart } from '../../../contexts';
import { useGetBookById } from '../../../services/book.service';
import { Reviews } from './Reviews';

export function BookDetails() {
	const { auth } = useAuth();
	const navigate = useNavigate();
	const { id: bookId = '' } = useParams<{ id: string }>();
	const { addToCartAndUpdateServer } = useCart();

	const { data, isPending, isError, isSuccess } = useGetBookById(bookId);

	if (isPending) return <Loading />;

	if (isError) return <Navigate to='/error' replace />;

	if (isSuccess && !data) {
		return <Navigate to='/page-not-found' replace />;
	}

	if (isSuccess && data) {
		const { data: book } = data;

		const handleAddToCart = async () => {
			addToCartAndUpdateServer(book);
			enqueueSnackbar({
				message: `"${book.title}" added to cart`,
				variant: 'success',
			});
		};

		return (
			<Stack gap={2}>
				<Breadcrumbs aria-label='breadcrumb'>
					<LinkRouter underline='hover' color='inherit' to='/'>
						Home
					</LinkRouter>
					<LinkRouter underline='hover' color='inherit' to='/books'>
						Books
					</LinkRouter>
					<Typography color='text.primary'>{book.title}</Typography>
				</Breadcrumbs>

				<Grid container spacing={2}>
					<Grid item xs={12} md={4}>
						<CardMedia
							component='img'
							height='300'
							sx={{ p: 2, objectFit: 'contain' }}
							image={`https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` || DEFAULT_COVER_IMG}
							alt={book.title}
						/>
					</Grid>
					<Grid item xs={12} md={8} sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
						<Typography variant='h4' gutterBottom>
							{book.title}
						</Typography>
						<Typography variant='h6' color='text.secondary' gutterBottom>
							by {book.author}
						</Typography>
						<Typography variant='h5' color={red[600]}>
							${book.price.toFixed(2)}
						</Typography>

						<Stack gap={2} mt={2} sx={{ flexGrow: 1, flexDirection: 'column-reverse' }}>
							<Stack direction='row' gap={2} mt={2}>
								{!auth?.user.isAdmin ? (
									<>
										<Button variant='contained' disabled={!book.stock} onClick={handleAddToCart}>
											{!!book.stock ? `Add to Cart` : 'Out of Stock'}
										</Button>
										{!!auth && <WishlistBtn bookTitle={book.title} bookId={book._id} />}
									</>
								) : (
									<Button
										variant='contained'
										disabled={!book.stock}
										onClick={() => navigate(`/books/edit/${book._id}`)}>
										Edit Details
									</Button>
								)}
							</Stack>
						</Stack>
					</Grid>
				</Grid>

				<Divider />
				<Typography variant='h6'>Description</Typography>
				<Stack gap={1} pl={2}>
					<Typography paragraph>{book.description || 'No description available.'}</Typography>
				</Stack>

				<Divider />
				<Typography variant='h6'>Book Details</Typography>
				<Stack gap={1} pl={2}>
					<Typography variant='body2' color='text.secondary'>
						<b>Author:</b> {book.author}
					</Typography>
					<Typography variant='body2' color='text.secondary'>
						<b>ISBN:</b> {book.isbn}
					</Typography>
					<Typography variant='body2' color='text.secondary'>
						<b>Category:</b> {book.categoryId.name}
					</Typography>
					{book.publishedDate && (
						<Typography variant='body2' color='text.secondary'>
							<b>Date Published:</b> {new Date(book.publishedDate).toLocaleDateString()}
						</Typography>
					)}
				</Stack>

				<Divider />
				<Typography variant='h6'>Reviews</Typography>
				<Stack gap={1} pl={1}>
					<Reviews bookId={book._id} />
				</Stack>
			</Stack>
		);
	}
}
