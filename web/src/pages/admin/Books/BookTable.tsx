import AddBoxIcon from '@mui/icons-material/AddBox';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
// import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import {
	Alert,
	alpha,
	Box,
	Checkbox,
	IconButton,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TableSortLabel,
	Toolbar,
	Tooltip,
	Typography,
} from '@mui/material';

import { green, red, yellow } from '@mui/material/colors';
import { visuallyHidden } from '@mui/utils';
import { useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loading } from '../../../components';
import { LOW_STOCK_QTY } from '../../../consts';
import { useAuth } from '../../../contexts';
import { useDeleteMultipleBooks, useGetBooks } from '../../../services';
import { BookT } from '../../../types';
import { AddStockDialog } from './components/AddStockDialog';

type Order = 'asc' | 'desc';
type BookSummaryT = Pick<BookT, 'isbn' | 'title' | 'author' | 'price' | 'stock'>;

interface HeadCell {
	disablePadding: boolean;
	id: keyof BookSummaryT;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{ id: 'isbn', numeric: false, disablePadding: true, label: 'ISBN' },
	{ id: 'title', numeric: false, disablePadding: false, label: 'Title' },
	{ id: 'author', numeric: false, disablePadding: false, label: 'Author' },
	{ id: 'price', numeric: true, disablePadding: false, label: 'Price' },
	{ id: 'stock', numeric: true, disablePadding: false, label: 'Stock' },
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof BookSummaryT) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
	const createSortHandler = (property: keyof BookSummaryT) => (event: React.MouseEvent<unknown>) => {
		onRequestSort(event, property);
	};

	return (
		<TableHead>
			<TableRow>
				<TableCell padding='checkbox'>
					<Checkbox
						color='primary'
						indeterminate={numSelected > 0 && numSelected < rowCount}
						checked={rowCount > 0 && numSelected === rowCount}
						onChange={onSelectAllClick}
					/>
				</TableCell>
				{headCells.map(headCell => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'right' : 'left'}
						padding={headCell.disablePadding ? 'none' : 'normal'}
						sortDirection={orderBy === headCell.id ? order : false}>
						<TableSortLabel
							active={orderBy === headCell.id}
							direction={orderBy === headCell.id ? order : 'asc'}
							onClick={createSortHandler(headCell.id)}>
							{headCell.label}
							{orderBy === headCell.id ? (
								<Box component='span' sx={visuallyHidden}>
									{order === 'desc' ? 'sorted descending' : 'sorted ascending'}
								</Box>
							) : null}
						</TableSortLabel>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface EnhancedTableToolbarProps {
	totalCount: number;
	numSelected: number;
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

function EnhancedTableToolbar({ totalCount, numSelected, selected, setSelected }: EnhancedTableToolbarProps) {
	const { auth } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const deleteMutation = useDeleteMultipleBooks(auth?.token as string);

	const handleDeleteBtnClick = () => {
		if (confirm(`Are you sure to delete ${numSelected} ${numSelected > 1 ? 'books' : 'book'}?`)) {
			deleteMutation.mutate(selected, {
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ['books'] });
					setSelected([]);
					enqueueSnackbar(`Deleted ${numSelected} ${numSelected > 1 ? 'books' : 'book'}`, {
						variant: 'success',
					});
				},
				onError: () => enqueueSnackbar('An error occurred', { variant: 'error' }),
			});
		}
	};

	const handleEditBtnClick = () => navigate(`/books/edit/${selected[0]}`);

	const handleAddBookBtnClick = () => navigate('/books/create');

	return (
		<Toolbar
			sx={[
				{
					pl: { sm: 2 },
					pr: { xs: 1, sm: 1 },
				},
				numSelected > 0 && {
					bgcolor: theme => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
				},
			]}>
			{numSelected > 0 ? (
				<Typography sx={{ flex: '1 1 100%' }} color='inherit' variant='subtitle1' component='div'>
					{numSelected} selected
				</Typography>
			) : (
				<Typography sx={{ flex: '1 1 100%' }} variant='h6' id='tableTitle' component='div'>
					{totalCount} {totalCount > 1 ? 'Books' : 'Book'}
				</Typography>
			)}
			{numSelected > 0 ? (
				<Stack direction='row' gap={2}>
					{numSelected === 1 && (
						<Tooltip title='Edit Details'>
							<IconButton onClick={handleEditBtnClick} color='primary'>
								<EditIcon />
							</IconButton>
						</Tooltip>
					)}

					<AddStockDialog bookIds={selected} onSuccess={() => setSelected([])} />

					<Tooltip title='Delete'>
						<IconButton onClick={handleDeleteBtnClick} color='error'>
							<DeleteIcon />
						</IconButton>
					</Tooltip>
				</Stack>
			) : (
				<Stack direction='row' gap={2}>
					<Tooltip title='Add Book'>
						<IconButton onClick={handleAddBookBtnClick} color='primary'>
							<AddBoxIcon />
						</IconButton>
					</Tooltip>

					<Tooltip title='Filter list'>
						<IconButton>
							<FilterListIcon />
						</IconButton>
					</Tooltip>
				</Stack>
			)}
		</Toolbar>
	);
}

export function BookTable() {
	const [order, setOrder] = useState<Order>('asc');
	const [sortBy, setSortBy] = useState<keyof BookSummaryT>('title');
	const [selected, setSelected] = useState<string[]>([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const { data, isPending, isError, isSuccess, refetch } = useGetBooks(page + 1, rowsPerPage, { sortBy, order });

	useEffect(() => {
		refetch();
	}, [order, sortBy, rowsPerPage]);

	useEffect(() => {
		setSelected([]);
	}, [page]);

	if (isPending) return <Loading />;
	if (isError) return <Navigate to='/error' replace />;
	if (isSuccess && !data) {
		return <Alert severity='info'>No books found.</Alert>;
	}

	if (isSuccess && data) {
		const {
			data: books,
			pagination: { totalItems, totalPages },
		} = data;

		const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof BookSummaryT) => {
			const isAsc = sortBy === property && order === 'asc';
			setOrder(isAsc ? 'desc' : 'asc');
			setSortBy(property);
		};

		const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
			if (event.target.checked) {
				const newSelected = books.map(book => book._id);
				setSelected(newSelected);
				return;
			}
			setSelected([]);
		};

		const handleClick = (_event: React.MouseEvent<unknown>, id: string) => {
			const selectedIndex = selected.indexOf(id);
			let newSelected: string[] = [];

			if (selectedIndex === -1) {
				newSelected = newSelected.concat(selected, id);
			} else if (selectedIndex === 0) {
				newSelected = newSelected.concat(selected.slice(1));
			} else if (selectedIndex === selected.length - 1) {
				newSelected = newSelected.concat(selected.slice(0, -1));
			} else if (selectedIndex > 0) {
				newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
			}
			setSelected(newSelected);
		};

		const handleChangePage = (_event: unknown, newPage: number) => {
			setPage(newPage);
		};

		const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
			setRowsPerPage(parseInt(event.target.value, 10));
			setPage(0);
		};

		const isSelected = (id: string) => selected.indexOf(id) !== -1;

		// Avoid a layout jump when reaching the last page with empty rows.
		const emptyRows = page > 0 && page + 1 === totalPages ? rowsPerPage - books.length : 0;

		return (
			<Box sx={{ width: '100%' }}>
				<Typography variant='h5' my={2}>
					Inventory Management
				</Typography>

				<Paper sx={{ width: '100%', mb: 2 }} variant='outlined'>
					<EnhancedTableToolbar
						totalCount={totalItems}
						numSelected={selected.length}
						selected={selected}
						setSelected={setSelected}
					/>
					<TableContainer>
						<Table sx={{ minWidth: 750 }} aria-labelledby='tableTitle' size='medium'>
							<EnhancedTableHead
								numSelected={selected.length}
								order={order}
								orderBy={sortBy}
								onSelectAllClick={handleSelectAllClick}
								onRequestSort={handleRequestSort}
								rowCount={books.length}
							/>
							<TableBody>
								{books.map((row, index) => {
									const isItemSelected = isSelected(row._id);
									const labelId = `enhanced-table-checkbox-${index}`;

									return (
										<TableRow
											hover
											onClick={event => handleClick(event, row._id)}
											role='checkbox'
											aria-checked={isItemSelected}
											tabIndex={-1}
											key={row._id}
											selected={isItemSelected}
											sx={{ cursor: 'pointer' }}>
											<TableCell padding='checkbox'>
												<Checkbox
													color='primary'
													checked={isItemSelected}
													inputProps={{ 'aria-labelledby': labelId }}
												/>
											</TableCell>
											<TableCell component='th' id={labelId} scope='row' padding='none'>
												{row.isbn}
											</TableCell>
											<TableCell align='left'>{row.title}</TableCell>
											<TableCell align='left'>{row.author}</TableCell>
											<TableCell align='right'>{row.price}</TableCell>
											<TableCell
												align='right'
												sx={{
													fontWeight: 'bold',
													color: !row.stock
														? red[500]
														: row.stock < LOW_STOCK_QTY
														? yellow[800]
														: green[700],
												}}>
												{row.stock}
											</TableCell>
										</TableRow>
									);
								})}
								{emptyRows > 0 && (
									<TableRow style={{ height: 53 * emptyRows }}>
										<TableCell colSpan={6} />
									</TableRow>
								)}
							</TableBody>
						</Table>
					</TableContainer>
					<TablePagination
						rowsPerPageOptions={[10, 25, 50]}
						component='div'
						count={totalItems}
						rowsPerPage={rowsPerPage}
						page={page}
						onPageChange={handleChangePage}
						onRowsPerPageChange={handleChangeRowsPerPage}
						showFirstButton
						showLastButton
					/>
				</Paper>
			</Box>
		);
	}
}
