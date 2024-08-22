import { Document, Schema, model } from 'mongoose';

interface Category extends Document {
	name: string;
	description: string;
}

const categorySchema = new Schema<Category>({
	name: { type: String, required: true, unique: true },
	description: { type: String },
});

export const Category = model<Category>('Category', categorySchema);
