import { claimAchievementReward } from "@/actions/claim-achievement-reward";
import { useCoinAnimation } from "@/app/context/coin_animation";
import { useSession } from "@/app/context/session";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import type { Achievement, AchievementItem } from "@/entities/achievement";
import { queryKeys } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Award, Coins } from "lucide-react";
import { memo, useState } from "react";

interface Props {
	achievements: Achievement[];
	isLoading?: boolean;
	sectionTitle?: string;
}

export const ProfileAchievements = memo(({ achievements, isLoading: externalLoading = false, sectionTitle = "Достижения" }: Props) => {
	const { isLoading: isSessionLoading, isProfileLoading } = useSession();
	const showSkeletons = isSessionLoading || isProfileLoading || externalLoading;

	if (showSkeletons) {
		return (
			<section className="space-y-2">
				<h3 className="text-lg font-semibold text-white flex items-center gap-2">
					<Award className="w-5 h-5 text-neon-cyan" />
					{sectionTitle}
				</h3>
				<div className="-mx-4 rounded-none overflow-hidden space-y-0">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-[72px] w-full rounded-none border-y border-neon-cyan/10" />
					))}
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-2">
			<h3 className="text-lg font-semibold text-white flex items-center gap-2">
				<Award className="w-5 h-5 text-neon-cyan" />
				{sectionTitle}
			</h3>
			<Accordion type="single" collapsible className="-mx-4 rounded-none overflow-hidden border-y border-neon-cyan/15">
				{achievements.map((achievement) => (
					<ProfileAchievementAccordionItem key={achievement.slug ?? achievement.name} achievement={achievement} />
				))}
			</Accordion>
		</section>
	);
});

const ProfileAchievementAccordionItem = memo(({ achievement }: { achievement: Achievement }) => {
	const unlocked = achievement.unlocked;
	const progress = `${achievement.current_value} / ${achievement.threshold}`;
	const hasReward = achievement.coin_reward != null && achievement.coin_reward > 0;
	const rewardClaimed = !!achievement.reward_claimed_at;
	const canClaim = unlocked && hasReward && !rewardClaimed;

	const { showCoinAnimation } = useCoinAnimation();
	const { refetchProfile } = useSession();
	const queryClient = useQueryClient();
	const [isClaiming, setIsClaiming] = useState(false);

	const handleClaim = async () => {
		if (!achievement.slug || !canClaim || isClaiming) return;
		setIsClaiming(true);
		try {
			const result = await claimAchievementReward(achievement.slug);
			showCoinAnimation(result.coinsAdded);
			const claimedAt = new Date().toISOString();
			queryClient.setQueryData<AchievementItem[]>(queryKeys.achievements, (prev) =>
				prev?.map((a) =>
					a.slug === achievement.slug ? { ...a, reward_claimed_at: claimedAt } : a
				)
			);
			void refetchProfile({ silent: true });
		} finally {
			setIsClaiming(false);
		}
	};

	return (
		<AccordionItem
			value={achievement.slug ?? achievement.name}
			className={cn(
				"border-y border-neon-cyan/15 bg-surface-card first:border-t-0",
				canClaim && "border-l-4 border-l-neon-gold bg-neon-gold/5"
			)}
		>
			<AccordionTrigger className="flex w-full items-center hover:no-underline py-0 px-4 [&[data-state=open]>svg]:rotate-180">
				<div className="flex flex-1 min-w-0 items-center gap-3 py-3 pr-3 text-left">
					<div className="relative shrink-0">
						<div
							className={cn(
								"w-9 h-9 rounded-lg flex items-center justify-center",
								unlocked ? "bg-neon-gold/15" : "bg-white/5",
								canClaim && "ring-2 ring-neon-gold/50"
							)}
						>
							<Award
								className={cn(
									"w-5 h-5 shrink-0",
									unlocked ? "text-neon-gold" : "text-gray-500"
								)}
							/>
						</div>
						{canClaim && (
							<span
								className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neon-gold ring-2 ring-surface-card"
								aria-hidden
							/>
						)}
					</div>
					<div className="min-w-0 flex-1">
						<p
							className={cn(
								"font-medium truncate",
								unlocked ? "text-white" : "text-gray-500",
								canClaim && "text-neon-gold"
							)}
						>
							{achievement.badge ? `${achievement.badge} ` : ""}{achievement.name}
							{canClaim && (
								<span className="ml-1.5 text-[10px] font-normal text-neon-gold/80">
									— Награда доступна!
								</span>
							)}
						</p>
						<p className="text-xs text-gray-500 mt-0.5 whitespace-normal">
							{achievement.description}
						</p>
					</div>
				</div>
			</AccordionTrigger>
			<AccordionContent className="p-4 pt-2 border-t border-neon-cyan/10">
				<div className="space-y-3 text-sm">
					<p className="text-white text-sm">{achievement.description}</p>
					<div>
						<p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Прогресс</p>
						<p className="text-white">
							{unlocked ? (
								<span className="text-neon-gold">Выполнено</span>
							) : (
								`${achievement.current_value} / ${achievement.threshold}`
							)}
						</p>
						{!unlocked && (
							<div className="mt-1.5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
								<div
									className="h-full rounded-full bg-neon-cyan/60 transition-all duration-300"
									style={{
										width: `${Math.min(100, (achievement.current_value / achievement.threshold) * 100)}%`,
									}}
								/>
							</div>
						)}
					</div>
					<div>
						<p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Награда</p>
						<p className="text-white flex items-center gap-1.5">
							{hasReward ? (
								<>
									<Coins className="w-4 h-4 text-neon-gold" />
									<span className="text-neon-gold">+{achievement.coin_reward} монет</span>
								</>
							) : (
								<span className="text-gray-500">Без награды</span>
							)}
						</p>
						{canClaim && (
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									void handleClaim();
								}}
								disabled={isClaiming}
								className="mt-3 w-full py-2.5 rounded-xl bg-neon-gold/20 text-neon-gold font-medium border border-neon-gold/40 hover:bg-neon-gold/30 disabled:opacity-50 transition-colors"
							>
								{isClaiming ? "Загрузка…" : "Забрать награду"}
							</button>
						)}
						{unlocked && hasReward && rewardClaimed && (
							<p className="mt-2 text-gray-500 text-xs">Награда получена</p>
						)}
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
});
