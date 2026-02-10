export type AdminEvent = {
	id: string;
	title: string;
	code: string | null;
	event_date: string;
	created_at: string;
};

export type AdminCatalogItem = {
	id: string;
	name: string;
	price: number;
	created_at: string;
};

export type PrizeCert = {
	id: string;
	code: string;
	coins_amount: number;
	used_at: string | null;
	created_at: string;
};
