import { Document, Schema, model } from 'mongoose';

interface Book extends Document {
	title: string;
	author: string;
	description: string;
	isbn: string;
	price: number;
	category: string;
	stock: number;
	ratings: {
		userId: string;
		rating: number;
		review: string;
	}[];
	publishedDate: Date;
	coverImage: string;
}

const bookSchema = new Schema<Book>({
	title: { type: String, required: true },
	author: { type: String, required: true },
	description: { type: String },
	isbn: { type: String, unique: true },
	price: { type: Number, required: true },
	category: { type: String, required: true },
	stock: { type: Number, required: true },
	ratings: [
		{
			userId: { type: Schema.Types.ObjectId, ref: 'User' },
			rating: { type: Number, min: 1, max: 5 },
			review: { type: String },
		},
	],
	publishedDate: { type: Date, required: true },
	coverImage: { type: String },
});

export const Book = model<Book>('Book', bookSchema);
