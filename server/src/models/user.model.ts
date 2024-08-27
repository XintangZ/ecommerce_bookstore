import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    address: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
    };
    wishlist: string[];
    isAdmin: boolean;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: {
        street: { type: String },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String },
    },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
    isAdmin: { type: Boolean, default: false }
});

export const User = model<IUser>('User', userSchema);
