import { zodResolver } from '@hookform/resolvers/zod';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Avatar, Box, Button, Container, CssBaseline, TextField, Typography } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts';
import { RegisterReqSchemaExt } from '../../../schemas';
import { useRegister, useLogin } from '../../../services';
import { LoginResT, RegisterReqExt, RegisterReqT } from '../../../types';
import { useState } from 'react';
import { AxiosError } from 'axios';

export function Register() {
  const [backendError, setBackendError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors },
    watch,
	} = useForm<RegisterReqExt>({
		resolver: zodResolver(RegisterReqSchemaExt),
	});

	const navigate = useNavigate();
	const { auth, login } = useAuth();
	const registerMutation = useRegister();
  const loginMutation = useLogin();

	if (!!auth) navigate(-1);

  const password = watch('password');

  const onSubmit: SubmitHandler<RegisterReqExt> = (data) => {
    const { confirmPassword, ...registerData } = data;
  
    registerMutation.mutate(registerData as RegisterReqT, {
      onSuccess: () => {
        // Login after successful registration
        loginMutation.mutate(
          { email: data.email, password: data.password },
          {
            onSuccess: (res: { data: LoginResT }) => {
              login(res.data);
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
				<Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
					<LockOutlinedIcon />
				</Avatar>
				<Typography component='h1' variant='h5'>
					Sign up
				</Typography>
				<Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
          {backendError && (
            <Typography color="error" variant="body2" align="center">
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
						{...register('confirmPassword', {
							validate: value => value === password || 'Passwords do not match',
						})}
						error={!!errors.confirmPassword}
						helperText={errors.confirmPassword?.message}
					/>
					<Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
						Sign Up
					</Button>
				</Box>
			</Box>
		</Container>
	);
}
