import { cn } from "@/lib/utils";

/**
 * Скелетон-лоадер в мягких серых тонах с анимацией мерцания (shimmer).
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("rounded-lg skeleton-shimmer", className)}
			{...props}
		/>
	);
}
