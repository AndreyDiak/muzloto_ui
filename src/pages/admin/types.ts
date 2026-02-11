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
