import { zodResolver } from '@hookform/resolvers/zod';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Avatar, Box, Button, Container, CssBaseline, TextField, Typography } from '@mui/material';
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
	});

	const navigate = useNavigate();
	const { auth, login } = useAuth();
	const loginMutation = useLogin();

	if (!!auth) navigate(-1);

	const onSubmit: SubmitHandler<LoginReqT> = data => {
		loginMutation.mutate(data, {
			onSuccess: res => {
				login(res.data);
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
				<Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
					<LockOutlinedIcon />
				</Avatar>
				<Typography component='h1' variant='h5'>
					Sign in
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
					<Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
						Sign In
					</Button>
				</Box>
			</Box>
		</Container>
	);
}
