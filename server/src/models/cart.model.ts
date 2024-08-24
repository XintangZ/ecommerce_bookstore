import mongoose, { Schema, Document, model } from 'mongoose';

interface CartItem {
  bookId: mongoose.Types.ObjectId; // Correct type
  quantity: number;
}

interface Cart extends Document {
  userId: mongoose.Types.ObjectId;  // Correct type
  items: CartItem[];
}

const cartSchema = new Schema<Cart>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
            quantity: { type: Number, required: true },
        }
    ]
});

export const Cart = model<Cart>('Cart', cartSchema);