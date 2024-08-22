import { Schema, model, Document, Types } from 'mongoose';

interface Order extends Document {
    userId: Types.ObjectId;
    books: {
        bookId: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    shippingAddress: {
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        province: string;
        zipCode: string;
        phone: string; 
    };
    status: string;
    placedAt: Date;
}

const orderSchema = new Schema<Order>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    books: [
        {
            bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        }
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, required: true },
        zipCode: { type: String, required: true },
        phone: { 
            type: String, 
            required: true,
            validate: {
                validator: function(v: string) {
                    // Regex for validating Canadian phone numbers in the format XXX-XXX-XXXX
                    return /^\d{3}-\d{3}-\d{4}$/.test(v); 
                },
                message: props => `${props.value} is not a valid Canadian phone number! It should be in the format XXX-XXX-XXXX.`
            }
        },
    },
    status: { type: String, enum: ['Pending', 'Shipped', 'Cancelled'], default: 'Pending' },
    placedAt: { type: Date, default: Date.now }
});

export const Order = model<Order>('Order', orderSchema);
