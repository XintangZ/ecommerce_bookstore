import { Document, Schema, model } from 'mongoose';

interface Review extends Document {
	bookId: Schema.Types.ObjectId;
	userId: Schema.Types.ObjectId;
	rating: number;
	review: string;
	createdAt: Date;
}

const reviewSchema = new Schema<Review>({
	bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	rating: { type: Number, min: 1, max: 5, required: true },
	review: { type: String },
	createdAt: { type: Date, default: Date.now },
});

export const Review = model<Review>('Review', reviewSchema);
