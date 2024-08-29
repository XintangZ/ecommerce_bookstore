import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Container, CssBaseline, Divider, Stack, TextField, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth, useCart } from '../../../contexts';
import { LoginReqSchema } from '../../../schemas';
import { fetchCart, useLogin } from '../../../services';
import { LoginReqT } from '../../../types';
import { enqueueSnackbar } from 'notistack';

export function Login() {
	const [backendError, setBackendError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginReqT>({
		resolver: zodResolver(LoginReqSchema),
		mode: 'onChange',
	});

	const navigate = useNavigate();
	const { login } = useAuth();
	const { getCartList } = useCart();
	const loginMutation = useLogin();

	const onSubmit: SubmitHandler<LoginReqT> = data => {
		loginMutation.mutate(data, {
			onSuccess: async res => {
				login(res.data);
				enqueueSnackbar(`Welcome, ${res.data.user.username}`, { variant: 'success', hideIconVariant: true });
				try {
					const cartData = await fetchCart(res.data.token);
					if (cartData) {
						getCartList(cartData.items);
					}
				} catch (error) {
						console.error('Failed to fetch cart data:', error);
				}
			},
			onError: error => {
				// Check if the error is an instance of AxiosError
				if (error instanceof AxiosError) {
					// Access the response data from AxiosError
					setBackendError(error.response?.data?.message || 'An error occurred');
				} else {
					// Handle other types of errors
					setBackendError('An error occurred');
				}
			},
		});
	};

	return (
		<Container component='main' maxWidth='xs'>
			<CssBaseline />
			<Box
				sx={{
					marginTop: 8,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}>
				<Typography
					variant='h4'
					onClick={() => navigate('/')}
					sx={{ mb: 2, cursor: 'pointer', textAlign: 'center', color: 'primary.main', fontWeight: 'bold' }}>
					BookStore
				</Typography>

				<Typography component='h1' variant='h5'>
					Login
				</Typography>
				<Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
					{backendError && (
						<Alert severity='error' sx={{ my: 2 }}>
							{backendError}
						</Alert>
					)}

					<TextField
						margin='normal'
						required
						fullWidth
						id='email'
						label='Email Address'
						autoComplete='email'
						autoFocus
						{...register('email')}
						error={!!errors.email}
						helperText={errors.email?.message}
					/>
					<TextField
						margin='normal'
						required
						fullWidth
						label='Password'
						type='password'
						id='password'
						autoComplete='current-password'
						{...register('password')}
						error={!!errors.password}
						helperText={errors.password?.message}
					/>

					<Stack gap={2} my={4}>
						<Button type='submit' fullWidth variant='contained'>
							Login
						</Button>

						<Divider>
							<Typography variant='body2' align='center' color='text.secondary'>
								Don't have an account?
							</Typography>
						</Divider>

						<Button fullWidth variant='outlined' onClick={() => navigate('/register')}>
							Register
						</Button>
					</Stack>
				</Box>
			</Box>
		</Container>
	);
}
