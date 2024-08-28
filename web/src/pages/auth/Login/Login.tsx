import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Container, CssBaseline, Divider, Stack, TextField, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts';
import { LoginReqSchema } from '../../../schemas';
import { useLogin } from '../../../services';
import { LoginReqT } from '../../../types';

export function Login() {
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
	const loginMutation = useLogin();

	const onSubmit: SubmitHandler<LoginReqT> = data => {
		loginMutation.mutate(data, {
			onSuccess: res => {
				login(res.data);
				enqueueSnackbar(`Welcome, ${res.data.user.username}`, { variant: 'success', hideIconVariant: true });
			},
			onError: error => {
				console.log(error);
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
