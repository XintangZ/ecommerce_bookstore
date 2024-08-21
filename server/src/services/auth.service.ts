
import jwt from 'jsonwebtoken';
import { IUser } from '../models/user.model';

const generateToken = (user: IUser, secretKey: string): string => {
    return jwt.sign(
        {
            name: user.name,
            email: user.email,
            address: user.address,
            isAdmin: user.isAdmin,
            _id: user._id
        },
        secretKey,
        {
            expiresIn: '1h',
            issuer: 'bookstore'
        }
    );
};

export { generateToken };
