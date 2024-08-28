import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Container, CssBaseline, Divider, Stack, TextField, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts';
import { RegisterReqSchemaExt } from '../../../schemas';
import { useLogin, useRegister } from '../../../services';
import { LoginResT, RegisterReqExt, RegisterReqT } from '../../../types';

export function Register() {
	const [backendError, setBackendError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterReqExt>({
		resolver: zodResolver(RegisterReqSchemaExt),
		mode: 'onChange',
	});

	const navigate = useNavigate();
	const { login } = useAuth();
	const registerMutation = useRegister();
	const loginMutation = useLogin();

	const onSubmit: SubmitHandler<RegisterReqExt> = data => {
		const { confirmPassword, ...registerData } = data;

		registerMutation.mutate(registerData as RegisterReqT, {
			onSuccess: () => {
				// Login after successful registration
				loginMutation.mutate(
					{ email: data.email, password: data.password },
					{
						onSuccess: (res: { data: LoginResT }) => {
							login(res.data);
							enqueueSnackbar(`Welcome, ${res.data.user.username}`, {
								variant: 'success',
								hideIconVariant: true,
							});
						},
					}
				);
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
					Register
				</Typography>
				<Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
					{backendError && (
						<Typography color='error' variant='body2' align='center'>
							{backendError}
						</Typography>
					)}
					<TextField
						margin='normal'
						required
						fullWidth
						id='username'
						label='Username'
						autoComplete='username'
						autoFocus
						{...register('name')}
						error={!!errors.name}
						helperText={errors.name?.message}
					/>
					<TextField
						margin='normal'
						required
						fullWidth
						id='email'
						label='Email Address'
						autoComplete='email'
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
					<TextField
						margin='normal'
						required
						fullWidth
						label='Confirm Password'
						type='password'
						id='confirm-password'
						autoComplete='current-password'
						{...register('confirmPassword')}
						error={!!errors.confirmPassword}
						helperText={errors.confirmPassword?.message}
					/>

					<Stack gap={2} my={4}>
						<Button type='submit' fullWidth variant='contained'>
							Register
						</Button>

						<Divider>
							<Typography variant='body2' align='center' color='text.secondary'>
								Already have an account?
							</Typography>
						</Divider>

						<Button fullWidth variant='outlined' onClick={() => navigate('/login')}>
							Login
						</Button>
					</Stack>
				</Box>
			</Box>
		</Container>
	);
}
