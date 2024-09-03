import { Chip, Stack } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useGetCategories } from '../services';
import { formatCamelToSentence } from '../utils';

export const FilterChips = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const { data: categories } = useGetCategories();

	const formatFilterChip = (searchParams: URLSearchParams) => {
		const params = Object.fromEntries(searchParams.entries());
		return Object.entries(params).map(([key, value]) => {
			let label = '';

			switch (key) {
				case 'isAvailable':
					label = value === 'true' ? 'In Stock' : 'Out of stock';
					break;
				case 'categoryId':
					label = categories?.data.find(item => item._id === value)?.name || '';
					break;
				case 'isLowStock':
					label = 'Low in Stock';
					break;
				default:
					label = `${formatCamelToSentence(key)}: ${value}`;
					break;
			}

			return { key, label };
		});
	};

	const filterChips = formatFilterChip(searchParams);

	const handleDeleteFilterChip = (filterKey?: string) => {
		if (filterKey) {
			searchParams.delete(filterKey);
			setSearchParams(searchParams);
		} else {
			setSearchParams();
		}
	};

	return !!filterChips.length ? (
		<Stack direction='row' gap={2}>
			{filterChips.map(item => (
				<Chip key={item.key} label={item.label} onDelete={() => handleDeleteFilterChip(item.key)} />
			))}

			<Chip label='Clear Filters' onClick={() => handleDeleteFilterChip()} color='error' variant='outlined' />
		</Stack>
	) : null;
};
