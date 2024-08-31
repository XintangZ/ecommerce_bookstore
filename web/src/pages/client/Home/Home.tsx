import { CardMedia, Divider, Grid, Stack, Typography } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import { Loading } from '../../../components';
import { useGetBooks } from '../../../services';
import { BookCard } from '../Books/BookCard';

export function Home() {
	const { data, isSuccess } = useGetBooks(1, 4, { sortBy: 'createdAt', order: 'desc' });

	return (
		<Stack my={2} gap={3}>
			<Carousel duration={1500}>
				<CardMedia
					sx={{ objectFit: 'contain', maxHeight: 350 }}
					component='img'
					image='https://dispatch.barnesandnoble.com/content/dam/ccr/homepage/daily/2024/07/30/30048_Quote_DiscoverAugust_07_30_24.jpg'
					alt='carousel_1'
				/>
				<CardMedia
					sx={{ objectFit: 'contain', maxHeight: 350 }}
					component='img'
					image='https://dispatch.barnesandnoble.com/content/dam/ccr/homepage/daily/2024/07/30/30048_Quote_A1_BookClubAugust_07_30_24.jpg'
					alt='carousel_2'
				/>
				<CardMedia
					sx={{ objectFit: 'contain', maxHeight: 350 }}
					component='img'
					image='https://dispatch.barnesandnoble.com/content/dam/ccr/homepage/daily/2024/08/30/30292_BB_C_Book_Haul_YA_08_30_24.jpg'
					alt='carousel_3'
				/>
			</Carousel>

			<Divider>
				<Typography variant='h6' mx={2} color='text.secondary'>
					New Arrival
				</Typography>
			</Divider>

			<Grid container spacing={4} mb={3}>
				{isSuccess && data ? (
					data.data.map((book, index) => (
						<Grid item key={index} xs={12} sm={6} lg={3}>
							<BookCard book={book} />
						</Grid>
					))
				) : (
					<Loading />
				)}
			</Grid>
		</Stack>
	);
}
