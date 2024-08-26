export const getHeaders = (token: string) => {
	return {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
};
