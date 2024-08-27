import { CircularProgress, Stack } from '@mui/material';

export function Loading() {
	return (
		<Stack sx={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
			<CircularProgress />
		</Stack>
	);
}
