import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Grid, MenuItem, TextField } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useAuth } from '../../../contexts';
import { CreateBookSchema } from '../../../schemas';
import { useCreateBook, useGetCategories } from '../../../services';
import { CreateBookT } from '../../../types';

interface PropsI {
	defaultValues?: CreateBookT;
}

export function BookForm({ defaultValues }: PropsI) {
	const { auth } = useAuth();
	const { data, isPending, isError, isSuccess } = useGetCategories();
	const { mutate } = useCreateBook(auth?.token || '');

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateBookT>({
		resolver: zodResolver(CreateBookSchema),
		defaultValues,
	});

	const onSubmit: SubmitHandler<CreateBookT> = data => {
		console.log('🚀 ~ BookForm ~ data:', data);
		mutate(data, {
			onSuccess: res => {
				enqueueSnackbar('Book added', { variant: 'success' });
				console.log('🚀 ~ BookForm ~ res:', res);
			},
			onError: err => {
				console.log('🚀 ~ BookForm ~ err:', err);
			},
		});
	};

	return (
		<Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 3, maxWidth: 'lg', mx: 'auto' }}>
			<Grid container spacing={2}>
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
						helperText={errors.categoryId?.message}>
						{data ? (
							data.data.map(category => (
								<MenuItem key={category._id} value={category._id}>
									{category.name}
								</MenuItem>
							))
						) : (
							<MenuItem value={''} selected>
								No categories found
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
					<Button type='submit' fullWidth variant='contained' color='primary'>
						{defaultValues ? 'Update Book' : 'Add Book'}
					</Button>
				</Grid>
			</Grid>
		</Box>
	);
}
