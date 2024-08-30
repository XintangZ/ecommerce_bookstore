import { BookT } from "./book.type";

export type CartT = {
  bookId: string;
  quantity: number;
}

export type CartUpdateActionT = CartT & {
  action: 'add' | 'remove' | 'replace';
};

export type CartItemT = {
  bookId: BookT;
  quantity: number;
};