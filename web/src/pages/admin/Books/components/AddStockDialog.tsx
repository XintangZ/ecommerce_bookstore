import { zodResolver } from '@hookform/resolvers/zod';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	TextField,
	Tooltip,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../../../../contexts';
import { StockSchema } from '../../../../schemas';
import { useUpdateMultipleBookStocks } from '../../../../services';

interface PropsI {
	bookIds: string[];
	onSuccess: () => void;
}

const schema = z.object({
	stockChange: StockSchema,
});

type FormData = z.infer<typeof schema>;

export function AddStockDialog({ bookIds, onSuccess }: PropsI) {
	const { auth } = useAuth();
	const [open, setOpen] = useState(false);
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

	const queryClient = useQueryClient();
	const { mutate: updateStock, isPending } = useUpdateMultipleBookStocks(auth?.token as string);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormData>({
		defaultValues: {
			stockChange: 0,
		},
		resolver: zodResolver(schema),
	});

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		reset();
	};

	const onSubmit: SubmitHandler<FormData> = data => {
		updateStock(
			{ bookIds, ...data },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ['books'] });
					onSuccess();
					enqueueSnackbar('Stock added', { variant: 'success' });
				},
				onError: () => enqueueSnackbar('An error occurred', { variant: 'error' }),
			}
		);
		handleClose();
	};

	return (
		<>
			<Tooltip title='Add Stock'>
				<IconButton onClick={handleClickOpen} color='primary'>
					<LibraryBooksIcon />
				</IconButton>
			</Tooltip>

			<Dialog
				fullScreen={fullScreen}
				open={open}
				onClose={handleClose}
				PaperProps={{
					component: 'form',
					onSubmit: handleSubmit(onSubmit),
				}}>
				<DialogTitle>Add Stock</DialogTitle>

				<DialogContent>
					<DialogContentText width={{ sm: 300 }}>Enter the stock quantity to add:</DialogContentText>
					<TextField
						autoFocus
						required
						margin='dense'
						id='stockChange'
						type='number'
						fullWidth
						variant='standard'
						{...register('stockChange')}
						error={!!errors.stockChange}
						helperText={errors.stockChange?.message}
						inputProps={{ min: 0, step: 10 }}
						inputMode='numeric'
					/>
				</DialogContent>

				<DialogActions>
					<Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
						Cancel
					</Button>
					<Button type='submit' disabled={isPending}>
						{isPending ? 'Updating...' : 'Update Stock'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
