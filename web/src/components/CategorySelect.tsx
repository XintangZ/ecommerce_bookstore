import { MenuItem, Select, SelectChangeEvent, SelectProps } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useGetCategories } from '../services';

export function CategorySelect({ ...props }: Omit<SelectProps, 'onChange' | 'value'>) {
	const [searchParams, setSearchParams] = useSearchParams();
	const { data: categories } = useGetCategories();

	const handleCategoryChange = (event: SelectChangeEvent<unknown>) => {
		const categoryId = event.target.value as string;
		categoryId ? searchParams.set('categoryId', categoryId) : searchParams.delete('categoryId');
		setSearchParams(searchParams);
	};

	return (
		<Select
			value={searchParams.get('categoryId') || ''}
			onChange={handleCategoryChange}
			inputProps={{ 'aria-label': 'Filter by category' }}
			{...props}>
			<MenuItem value=''>
				<em>All Categories</em>
			</MenuItem>
			{categories?.data.map(category => (
				<MenuItem key={category._id} value={category._id}>
					{category.name}
				</MenuItem>
			))}
		</Select>
	);
}
