import { Alert, AlertTitle, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface PropsI {
	title?: string;
	msgType: 'info' | 'success' | 'warning' | 'error';
	msg: string;
	redirectPage?: string;
	redirectUrl?: string;
	interval?: number;
}

export function Redirect({ title, msgType, msg, redirectPage, redirectUrl, interval = 5 }: PropsI) {
	const navigate = useNavigate();

	const [countdown, setCountdown] = useState(interval);

	const goToPage = (redirectUrl?: string) => {
		if (redirectUrl) {
			navigate(redirectUrl, { replace: true });
		} else {
			navigate(-1);
		}
	};

	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown(prevCountdown => {
				if (prevCountdown <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prevCountdown - 1;
			});
		}, 1000);

		if (countdown === 0) goToPage(redirectUrl);

		return () => clearInterval(timer);
	}, [countdown, navigate]);

	return (
		<Alert severity={msgType}>
			{title && <AlertTitle>{title}</AlertTitle>}

			{msg.split('\n').map((line, index) => (
				<Typography key={index} lineHeight={'2'}>
					{line}
				</Typography>
			))}

			<Typography color='text.secondary' variant='body2'>
				You will be redirected to {redirectPage || 'the previous'} page in {countdown}{' '}
				{countdown > 1 ? 'seconds' : 'second'}
				...
				<br />
				If your browser does not redirect,{' '}
				<Link onClick={() => goToPage(redirectUrl)} to={''}>
					click here
				</Link>
				.
			</Typography>
		</Alert>
	);
}
