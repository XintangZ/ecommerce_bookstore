import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, CircularProgress, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts';
import { CreateBookSchema } from '../../../schemas';
import { useCreateBook, useGetBookById, useGetCategories, useUpdateBook } from '../../../services';
import { CreateBookT } from '../../../types';

export function BookForm() {
	const { auth } = useAuth();
	const { id: bookId } = useParams();
	const navigate = useNavigate();

	const { data: categoriesData, isLoading: isCategoriesLoading, isError: isCategoriesError } = useGetCategories();
	const { mutate: createBook, isPending: isCreating } = useCreateBook(auth?.token as string);
	const { mutate: updateBook, isPending: isUpdating } = useUpdateBook(auth?.token as string, bookId as string);

	const queryClient = useQueryClient();
	const { data: bookData, isLoading: isBookLoading, isSuccess: bookIsSuccess } = useGetBookById(bookId as string);

	const {
		watch,
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<CreateBookT>({
		resolver: zodResolver(CreateBookSchema),
	});

	useEffect(() => {
		if (bookIsSuccess && bookData) {
			const { title, author, description, isbn, price, categoryId, stock, publishedDate, coverImage } =
				bookData.data;

			const formattedDate = new Date(publishedDate as unknown as string).toISOString().split('T')[0];

			setValue('title', title);
			setValue('title', title);
			setValue('author', author);
			setValue('description', description);
			setValue('isbn', isbn);
			setValue('price', price.toString() as unknown as number);
			setValue('categoryId', categoryId._id);
			setValue('stock', stock.toString() as unknown as number);
			setValue('publishedDate', formattedDate as unknown as Date);
			setValue('coverImage', coverImage);
		}
	}, [bookIsSuccess, bookData, setValue]);

	const onSubmit: SubmitHandler<CreateBookT> = data => {
		const isUpdate = bookIsSuccess && bookData;
		const options = {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['books'] });
				enqueueSnackbar(`Book ${isUpdate ? 'updated' : 'added'}`, { variant: 'success' });
				navigate('/books', { replace: true });
			},
			onError: (err: Error) => {
				enqueueSnackbar(`Failed to ${isUpdate ? 'update' : 'add'} book: `, { variant: 'error' });
				console.error(`Error ${isUpdate ? 'updating' : 'adding'} book: `, err);
			},
		};

		isUpdate ? updateBook(data, options) : createBook(data, options);
	};

	if (isBookLoading) {
		return <CircularProgress />;
	}

	return (
		<Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 3, maxWidth: 'lg', mx: 'auto' }}>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Typography variant='h5'>{bookIsSuccess && bookData ? 'Edit Book Details' : 'Add Book'}</Typography>
				</Grid>

				<Grid item xs={12}>
					<TextField
						fullWidth
						label='Title'
						{...register('title')}
						error={!!errors.title}
						helperText={errors.title?.message}
					/>
				</Grid>

				<Grid item xs={12}>
					<TextField
						fullWidth
						label='Author'
						{...register('author')}
						error={!!errors.author}
						helperText={errors.author?.message}
					/>
				</Grid>

				<Grid item xs={12}>
					<TextField
						fullWidth
						label='Description'
						{...register('description')}
						error={!!errors.description}
						helperText={errors.description?.message}
						multiline
						rows={4}
					/>
				</Grid>

				<Grid item xs={12}>
					<TextField
						fullWidth
						label='ISBN'
						{...register('isbn')}
						error={!!errors.isbn}
						helperText={errors.isbn?.message}
					/>
				</Grid>

				<Grid item xs={12}>
					<TextField
						fullWidth
						label='Price'
						type='number'
						{...register('price')}
						error={!!errors.price}
						helperText={errors.price?.message}
					/>
				</Grid>

				<Grid item xs={12}>
					<TextField
						select
						fullWidth
						label='Category'
						{...register('categoryId')}
						error={!!errors.categoryId}
						helperText={errors.categoryId?.message}
						value={watch('categoryId') || ''}>
						{isCategoriesLoading ? (
							<MenuItem value='' disabled>
								Loading categories...
							</MenuItem>
						) : isCategoriesError ? (
							<MenuItem value='' disabled>
								Error loading categories
							</MenuItem>
						) : categoriesData?.data.length ? (
							categoriesData.data.map(category => (
								<MenuItem key={category._id} value={category._id}>
									{category.name}
								</MenuItem>
							))
						) : (
							<MenuItem value='' disabled>
								No categories available
							</MenuItem>
						)}
					</TextField>
				</Grid>

				<Grid item xs={12}>
					<TextField
						fullWidth
						label='Stock'
						type='number'
						{...register('stock')}
						error={!!errors.stock}
						helperText={errors.stock?.message}
					/>
				</Grid>

				<Grid item xs={12}>
					<TextField
						fullWidth
						label='Date Published'
						type='date'
						{...register('publishedDate')}
						error={!!errors.publishedDate}
						helperText={errors.publishedDate?.message}
						InputLabelProps={{
							shrink: true,
						}}
					/>
				</Grid>

				<Grid item xs={12}>
					<TextField
						fullWidth
						label='Cover Image URL'
						{...register('coverImage')}
						error={!!errors.coverImage}
						helperText={errors.coverImage?.message}
					/>
				</Grid>

				<Grid item xs={12}>
					<Button
						type='submit'
						fullWidth
						variant='contained'
						color='primary'
						disabled={isCreating || isUpdating}>
						{bookIsSuccess && bookData ? 'Update Book' : 'Add Book'}
					</Button>
				</Grid>

				<Grid item xs={12}>
					<Button fullWidth variant='outlined' color='primary' onClick={() => navigate('/books')}>
						Cancel
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
}
