import { useSession } from "@/app/context/session";
import { Skeleton } from "@/components/ui/skeleton";
import { ClickableTooltip, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { IProfileStats } from "@/entities/profile";
import { useAchievements } from "@/hooks/use-achievements";
import { Award, BarChart3, Gamepad2 } from "lucide-react";
import { memo, useMemo } from "react";
import { Link } from "react-router";

const VISIT_REWARD_EVERY = 5;

interface Props {
	stats: IProfileStats[];
	/** Загрузка данных статистики (регистрации, билеты, ачивки) */
	isLoading?: boolean;
}

export const ProfileStats = memo(({ stats, isLoading: statsLoading = false }: Props) => {
	const { isLoading: isSessionLoading, isProfileLoading } = useSession();
	const showSkeletons = isSessionLoading || isProfileLoading || statsLoading;

	if (showSkeletons) {
		return (
			<section className="space-y-2">
				<h3 className="text-lg font-semibold text-white flex items-center gap-2">
					<BarChart3 className="w-5 h-5 text-neon-cyan" />
					Моя статистика
				</h3>
				<div className="grid grid-cols-2 gap-3">
					{Array.from({ length: 2 }).map((_, i) => (
						<Skeleton key={i} className="h-[88px] w-full rounded-xl" />
					))}
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-2">
			<h3 className="text-lg font-semibold text-white flex items-center gap-2">
				<BarChart3 className="w-5 h-5 text-neon-cyan" />
				Моя статистика
			</h3>
			<div className="grid grid-cols-2 gap-3">
				{stats.map((stat) => (
					<ProfileStat key={stat.label} stat={stat} />
				))}
			</div>
		</section>
	);
});

const statCardContent = (stat: IProfileStats) => {
	const Icon = stat.icon;
	const showVisitProgress =
		stat.visitRewardEvery != null &&
		(stat.visitRewardProgress != null || stat.visitRewardPending);
	const displayProgress = stat.visitRewardPending
		? stat.visitRewardEvery!
		: (stat.visitRewardProgress ?? 0);

	return (
		<>
			<div className="flex justify-between items-center mb-2">
				<p className="text-2xl mb-1" style={{ color: stat.textColor }}>
					{stat.value}
				</p>
				<Icon className="w-6 h-6 mb-2 shrink-0" style={{ color: stat.textColor }} />
			</div>
			<p className={`text-xs text-left ${stat.labelClassName ?? "text-gray-400"}`}>{stat.label}</p>
			{showVisitProgress && (
				<div className="mt-2 flex items-center gap-1">
					{Array.from({ length: stat.visitRewardEvery! }).map((_, i) => (
						<div
							key={i}
							className={`flex-1 min-w-0 aspect-square rounded-full border-2 flex items-center justify-center ${
								i < displayProgress
									? "border-neon-gold/50 bg-neon-gold/20"
									: "border-white/20 bg-white/5"
							}`}
							aria-hidden
						/>
					))}
					<span className="text-[10px] text-gray-500 ml-1 tabular-nums">
						{stat.visitRewardPending
							? "Награда!"
							: `${displayProgress}/${stat.visitRewardEvery}`}
					</span>
				</div>
			)}
		</>
	);
};

const ProfileStat = memo(({ stat }: { stat: IProfileStats }) => {
	const cardClassName = `rounded-xl w-full p-3 border border-white/10 ${stat.bgColor}`;

	if (stat.path) {
		return (
			<Tooltip key={stat.label}>
				<TooltipTrigger asChild>
					<Link to={stat.path} className={`block ${cardClassName} hover:border-neon-cyan/30 transition-colors`}>
						{statCardContent(stat)}
					</Link>
				</TooltipTrigger>
				<TooltipContent
					side="bottom"
					style={{
						// @ts-expect-error CSS variable for tooltip background
						"--foreground": stat.bgColor,
					}}
				>
					<p className="text-sm text-white">{stat.description}</p>
				</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<ClickableTooltip key={stat.label}>
			<TooltipTrigger className={cardClassName}>
				{statCardContent(stat)}
			</TooltipTrigger>
			<TooltipContent
				side="bottom"
				style={{
					// @ts-expect-error CSS variable for tooltip background
					"--foreground": stat.bgColor,
				}}
			>
				<p className="text-sm text-white">{stat.description}</p>
			</TooltipContent>
		</ClickableTooltip>
	);
});

const DEFAULT_CARD_BG = "bg-surface-card";

/** Собирает данные и рендерит блок «Моя статистика» на странице профиля. */
export const ProfileStatsSection = memo(() => {
	const { isSupabaseSessionReady } = useSession();
	const {
		gamesVisited,
		visitRewardProgress,
		visitRewardPending,
		achievements,
		isLoading: achievementsLoading,
	} = useAchievements(isSupabaseSessionReady);

	const stats: IProfileStats[] = useMemo(() => {
		const unlocked = achievements.filter((a) => a.unlocked).length;
		const total = achievements.length;

		return [
			{
				icon: Gamepad2,
				label: "Посещено игр",
				value: String(gamesVisited),
				textColor: "var(--color-neon-gold)",
				bgColor: DEFAULT_CARD_BG,
				description: "Количество посещённых мероприятий. Каждые 5 — награда.",
				path: "/achievements",
				visitRewardProgress,
				visitRewardEvery: VISIT_REWARD_EVERY,
				visitRewardPending,
			},
			{
				icon: Award,
				label: "Достижения",
				value: total > 0 ? `${unlocked}/${total}` : "0",
				textColor: "var(--color-neon-cyan)",
				bgColor: DEFAULT_CARD_BG,
				description: "Разблокированные достижения",
				path: "/achievements",
			},
		];
	}, [gamesVisited, visitRewardProgress, visitRewardPending, achievements]);

	return <ProfileStats stats={stats} isLoading={achievementsLoading} />;
});
