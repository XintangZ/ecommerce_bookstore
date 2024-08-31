export type UserT = {
	email: string;
	name: string;
	address?: AddressT;
	wishlist: [];
	isAdmin: boolean;
};

export type AddressT = {
	street: string;
	city: string;
	postalCode: string;
	province: string;
};

export type GetUserResT = {
	data: UserT
}