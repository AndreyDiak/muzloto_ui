import { useToast } from "@/app/context/toast";
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { authFetch } from "@/lib/auth-fetch";
import { uploadCatalogPhoto } from "@/lib/storage-catalog";
import { prettifyCoins } from "@/lib/utils";
import { ADMIN_BACKEND_URL } from "./constants";
import type { AdminCatalogItem } from "./types";
import { ImagePlus, Loader2, Package, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export function CatalogSection() {
	const { showToast } = useToast();
	const [items, setItems] = useState<AdminCatalogItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState(0);
	const [photoUrl, setPhotoUrl] = useState<string | null>(null);
	const [photoUploading, setPhotoUploading] = useState(false);
	const [creating, setCreating] = useState(false);
	const photoInputRef = useRef<HTMLInputElement>(null);

	const load = useCallback(async () => {
		try {
			const res = await authFetch(`${ADMIN_BACKEND_URL}/api/admin/catalog`);
			const data = await res.json();
			if (res.ok) setItems(data.items ?? []);
			else showToast(data.error ?? "Ошибка загрузки каталога", "error");
		} catch (e) {
			showToast(e instanceof Error ? e.message : "Ошибка", "error");
		} finally {
			setLoading(false);
		}
	}, [showToast]);

	useEffect(() => {
		load();
	}, [load]);

	const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setPhotoUploading(true);
		try {
			const { publicUrl } = await uploadCatalogPhoto(file);
			setPhotoUrl(publicUrl);
			showToast("Фото загружено", "success");
		} catch (err) {
			showToast(err instanceof Error ? err.message : "Ошибка загрузки фото", "error");
		} finally {
			setPhotoUploading(false);
			e.target.value = "";
		}
	};

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = name.trim();
		if (!trimmed) {
			showToast("Введите название", "error");
			return;
		}
		setCreating(true);
		try {
			const res = await authFetch(`${ADMIN_BACKEND_URL}/api/admin/catalog`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: trimmed,
					description: description.trim() || undefined,
					price: price >= 0 ? price : 0,
					photo: photoUrl ?? undefined,
				}),
			});
			const data = await res.json();
			if (!res.ok) {
				showToast(data.error ?? "Ошибка", "error");
				return;
			}
			showToast(`Позиция «${data.name}» добавлена в каталог`, "success");
			setName("");
			setDescription("");
			setPrice(0);
			setPhotoUrl(null);
			await load();
		} catch (err) {
			showToast(err instanceof Error ? err.message : "Ошибка", "error");
		} finally {
			setCreating(false);
		}
	};

	const handleDelete = async (id: string, itemName: string) => {
		if (!confirm(`Удалить «${itemName}» из каталога?`)) return;
		try {
			const res = await authFetch(`${ADMIN_BACKEND_URL}/api/admin/catalog/${id}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (!res.ok) {
				showToast(data.error ?? "Ошибка удаления", "error");
				return;
			}
			showToast("Позиция удалена из каталога", "success");
			await load();
		} catch (err) {
			showToast(err instanceof Error ? err.message : "Ошибка", "error");
		}
	};

	return (
		<AccordionItem
			value="catalog"
			className="bg-surface-card border border-white/[0.06] rounded-xl overflow-hidden"
		>
			<AccordionTrigger className="px-4 py-3 text-white hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-white/[0.06]">
				<span className="flex items-center gap-2">
					<Package className="w-5 h-5 text-neon-cyan" />
					Каталог
				</span>
			</AccordionTrigger>
			<AccordionContent className="px-4 pb-4 pt-2">
				<form onSubmit={handleCreate} className="space-y-3 mb-4">
					<Input
						type="text"
						placeholder="Название"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full px-3 py-2 rounded-lg bg-surface-dark border border-white/[0.08] text-white placeholder:text-gray-500 text-sm"
					/>
					<Textarea
						placeholder="Описание"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={2}
						className="w-full px-3 py-2 rounded-lg bg-surface-dark border border-white/[0.08] text-white placeholder:text-gray-500 text-sm resize-none"
					/>
					<Input
						type="number"
						placeholder="Цена (монеты)"
						min={0}
						value={price || ""}
						onChange={(e) => setPrice(Number(e.target.value) || 0)}
						className="w-full px-3 py-2 rounded-lg bg-surface-dark border border-white/[0.08] text-white placeholder:text-gray-500 text-sm"
					/>
					<div className="space-y-1.5">
						<label className="text-gray-400 text-xs block">Фото товара</label>
						<input
							ref={photoInputRef}
							type="file"
							accept="image/jpeg,image/png,image/webp"
							className="hidden"
							onChange={handlePhotoChange}
						/>
						<div className="flex items-center gap-2 flex-wrap">
							<button
								type="button"
								onClick={() => photoInputRef.current?.click()}
								disabled={photoUploading}
								className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-dark border border-white/[0.08] text-gray-300 text-sm hover:bg-white/[0.06] disabled:opacity-50"
							>
								{photoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
								{photoUrl ? "Заменить фото" : "Загрузить фото"}
							</button>
							{photoUrl && (
								<>
									<img src={photoUrl} alt="" className="w-14 h-14 rounded-lg object-cover border border-white/10" />
									<button
										type="button"
										onClick={() => setPhotoUrl(null)}
										className="text-xs text-gray-400 hover:text-white"
									>
										Убрать
									</button>
								</>
							)}
						</div>
					</div>
					<button
						type="submit"
						disabled={creating}
						className="w-full py-2.5 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-medium text-sm hover:bg-neon-cyan/30 disabled:opacity-50 flex items-center justify-center gap-2"
					>
						{creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
						Добавить в каталог
					</button>
				</form>
				<div className="space-y-2">
					{loading ? (
						<p className="text-gray-400 text-sm">Загрузка...</p>
					) : items.length === 0 ? (
						<p className="text-gray-400 text-sm">Каталог пуст</p>
					) : (
						items.map((item) => (
							<div
								key={item.id}
								className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-surface-dark border border-white/[0.06]"
							>
								<div className="min-w-0">
									<p className="text-white font-medium truncate">{item.name}</p>
									<p className="text-gray-400 text-xs">{prettifyCoins(item.price)} монет</p>
								</div>
								<button
									type="button"
									onClick={() => handleDelete(item.id, item.name)}
									className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 shrink-0"
									aria-label="Удалить"
								>
									<Trash2 className="w-4 h-4" />
								</button>
							</div>
						))
					)}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
