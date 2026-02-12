import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface ImageWithFallbackProps {
	src: string;
	alt: string;
	className?: string;
	containerClassName?: string;
	loading?: "lazy" | "eager";
}

/**
 * Показывает скелетон до загрузки картинки, затем изображение.
 * При ошибке загрузки остаётся скелетон.
 */
export function ImageWithFallback({
	src,
	alt,
	className = "",
	containerClassName = "",
	loading = "lazy",
}: ImageWithFallbackProps) {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState(false);

	return (
		<div className={`relative w-full h-full min-h-0 overflow-hidden ${containerClassName}`}>
			{(!loaded || error) && (
				<Skeleton className="absolute inset-0 w-full h-full rounded-none" aria-hidden />
			)}
			{!error && (
				<img
					src={src}
					alt={alt}
					loading={loading}
					onLoad={() => setLoaded(true)}
					onError={() => setError(true)}
					className={`w-full h-full object-cover object-center transition-opacity duration-200 ${
						loaded ? "opacity-100" : "opacity-0"
					} ${className}`}
				/>
			)}
		</div>
	);
}
