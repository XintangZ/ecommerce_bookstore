import { MenuItem, Select, SelectChangeEvent, SelectProps } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

export function OrderStatusSelect({ ...props }: Omit<SelectProps, 'onChange' | 'value'>) {
	const [searchParams, setSearchParams] = useSearchParams();

	const handleStatusChange = (event: SelectChangeEvent<unknown>) => {
		const status = event.target.value as string;
		status ? searchParams.set('status', status) : searchParams.delete('status');
		setSearchParams(searchParams);
	};

	return (
		<Select
			value={searchParams.get('status') || ''}
			onChange={handleStatusChange}
			inputProps={{ 'aria-label': 'Filter by order status' }}
			{...props}>
			<MenuItem value=''>
				<em>All Status</em>
			</MenuItem>
			<MenuItem value='Pending'>Pending</MenuItem>
			<MenuItem value='Shipped'>Shipped</MenuItem>
			<MenuItem value='Cancelled'>Cancelled</MenuItem>
		</Select>
	);
}
