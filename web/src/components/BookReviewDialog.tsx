import { zodResolver } from '@hookform/resolvers/zod';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormHelperText,
	Rating,
	Stack,
	TextField,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useAuth } from '../contexts';
import { ReviewValidationSchema } from '../schemas';
import { useCreateReview } from '../services';
import { ReviewValidationT } from '../types';

interface PropsI {
	bookId: string;
	bookTitle: string;
}

export function BookReviewDialog({ bookId, bookTitle }: PropsI) {
	const { auth } = useAuth();
	const [open, setOpen] = useState(false);
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

	const queryClient = useQueryClient();
	const { mutate: createReview, isPending } = useCreateReview(auth?.token as string, bookId);

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<ReviewValidationT>({
		resolver: zodResolver(ReviewValidationSchema),
	});

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		reset();
	};

	const onSubmit: SubmitHandler<ReviewValidationT> = data => {
		createReview(data, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['reviews'] });
				enqueueSnackbar('Review created successfully', { variant: 'success' });
			},
			onError: () => enqueueSnackbar('An error occurred', { variant: 'error' }),
		});
		handleClose();
	};

	return (
		<>
			<Button onClick={handleClickOpen} color='primary'>
				Write a Review
			</Button>

			<Dialog
				fullWidth
				fullScreen={fullScreen}
				open={open}
				onClose={handleClose}
				PaperProps={{
					component: 'form',
					onSubmit: handleSubmit(onSubmit),
				}}>
				<DialogTitle>
					Write your review for <em>"{bookTitle}"</em>:
				</DialogTitle>

				<DialogContent>
					<Stack gap={2}>
						<Stack direction='row' gap={2}>
							<Typography>Rating: </Typography>
							<Controller
								name='rating'
								control={control}
								defaultValue={0}
								render={({ field }) => (
									<Rating
										precision={0.5}
										{...field}
										onChange={(_event, newValue) => {
											field.onChange(newValue);
										}}
									/>
								)}
							/>
							{errors.rating && <FormHelperText error>{errors.rating.message}</FormHelperText>}
						</Stack>

						<TextField
							fullWidth
							multiline
							rows={4}
							{...register('review')}
							placeholder='Leave your thoughts here'
							error={!!errors.review}
							helperText={errors.review?.message}
						/>
					</Stack>
				</DialogContent>

				<DialogActions>
					<Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
						Cancel
					</Button>
					<Button type='submit' disabled={isPending}>
						{isPending ? 'Submitting...' : 'Submit'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
