import { useSession } from "@/app/context/session";
import { useCatalog } from "@/hooks/use-catalog";
import { useCssColor } from "@/hooks/use-css-color";
import { CatalogItem } from "./_item";

const colorVars = [
	"--accent-gold",
	"--accent-pink",
	"--accent-cyan",
	"--accent-purple",
	"--accent-blue",
];

export default function Catalog() {
	const { isRoot } = useSession();
	const colors = useCssColor(colorVars);
	const { error, isLoading, items } = useCatalog();

	if (isLoading) {
		return (
			<div className="p-4">
				<span className="text-gray-400">Загрузка каталога...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4">
				<div className="text-red-400">Ошибка загрузки: {error.message}</div>
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div className="p-4">
				<div className="text-gray-400">Каталог пуст :(</div>
			</div>
		);
	}

	return (
		<div className="p-4 space-y-6">
			{/* <h2 className="layout-header">
				Каталог
			</h2> */}

			{items.map((item, index) => (
				<CatalogItem key={item.id} item={item} color={colors[index % colors.length]} isRoot={isRoot} />
			))}
		</div>
	);
}