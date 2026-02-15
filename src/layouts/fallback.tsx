import { cn } from "@/lib/utils";
import { useRouteError } from "react-router";

/** Показывается при ошибке загрузки чанка (failed to fetch dynamically) или другой ошибке маршрута. */
export function RouteChunkErrorFallback() {
	const error = useRouteError();
	const isChunkError =
		error instanceof Error &&
		(/fetch|chunk|dynamic|import/i.test(error.message) || error.name === "ChunkLoadError");

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-dark p-6 text-center">
			<p className="text-white">
				{isChunkError
					? "Не удалось загрузить страницу. Проверьте интернет и попробуйте снова."
					: "Что-то пошло не так."}
			</p>
			<button
				type="button"
				onClick={() => window.location.reload()}
				className="rounded-xl bg-neon-cyan/20 px-6 py-3 text-neon-cyan border border-neon-cyan/40 font-medium"
			>
				Повторить
			</button>
		</div>
	);
}

export function LazyLoadingFallback() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <KaraokeLotoFallbackSVG />
    </div>
  );
}

export function KaraokeLotoFallbackSVG({
  className = "w-40 h-40",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn(`text-(--accent-cyan) animate-kl-fallback motion-reduce:animate-none`, className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Загрузка"
    >
      {/* Capsule */}
      <rect
        x="20"
        y="6"
        width="24"
        height="34"
        rx="12"
        stroke="currentColor"
        strokeWidth="2.2"
      />

      {/* Grill lines */}
      <line x1="24" y1="14" x2="40" y2="14" stroke="currentColor" strokeWidth="1.6" />
      <line x1="24" y1="20" x2="40" y2="20" stroke="currentColor" strokeWidth="1.6" />
      <line x1="24" y1="26" x2="40" y2="26" stroke="currentColor" strokeWidth="1.6" />

      {/* Stem */}
      <line
        x1="32"
        y1="40"
        x2="32"
        y2="52"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Base */}
      <line
        x1="24"
        y1="56"
        x2="40"
        y2="56"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
