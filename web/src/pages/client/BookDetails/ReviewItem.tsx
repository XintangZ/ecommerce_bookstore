import { ListItem, ListItemAvatar, ListItemText, Rating, Typography } from '@mui/material';
import { UserAvatar } from '../../../components';
import { ReviewT } from '../../../types';

interface PropsI {
	review: ReviewT;
}

export function ReviewItem({ review }: PropsI) {
	return (
		<ListItem key={review._id} alignItems='flex-start'>
			<ListItemAvatar>
				<UserAvatar userName={review.userId.name} />
			</ListItemAvatar>
			<ListItemText
				primary={
					<>
						<Rating value={review.rating} precision={0.5} readOnly />
						{review.createdAt && (
							<Typography variant='body2' color='textSecondary'>
								{`Reviewed on ${new Date(review.createdAt).toLocaleDateString()}`} by
								<b>{` ${review.userId.name}`}</b>
							</Typography>
						)}
					</>
				}
				secondary={
					<Typography variant='body1' marginTop={1}>
						{review.review}
					</Typography>
				}
			/>
		</ListItem>
	);
}
