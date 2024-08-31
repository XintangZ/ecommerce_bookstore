import { Document, Schema, model } from 'mongoose';

interface Book extends Document {
	title: string;
	author: string;
	description: string;
	isbn: string;
	price: number;
	categoryId: Schema.Types.ObjectId;
	stock: number;
	publishedDate: Date;
	coverImage: string;
	createdAt: Date;
}

const bookSchema = new Schema<Book>({
	title: { type: String, required: true },
	author: { type: String, required: true },
	description: { type: String },
	isbn: { type: String, unique: true },
	price: { type: Number, required: true },
	categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
	stock: { type: Number, required: true },
	publishedDate: { type: Date, required: true },
	coverImage: { type: String },
	createdAt: { type: Date, default: Date.now() },
});

export const Book = model<Book>('Book', bookSchema);
