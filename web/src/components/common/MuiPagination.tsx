import Pagination, { PaginationProps } from '@mui/material/Pagination';
import React from 'react';

interface Props extends PaginationProps {
	count: number;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
}

export function MuiPagination({ count, page, setPage, ...props }: Props) {
	const handleChange = (_event: React.ChangeEvent<unknown>, value: number) => {
		setPage(value);
	};

	return (
		<Pagination
			{...props}
			count={count}
			shape='rounded'
			color='primary'
			showFirstButton
			showLastButton
			page={page}
			onChange={handleChange}
		/>
	);
}
