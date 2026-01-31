import { useSession } from "@/app/context/session";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import type { Achievement } from "@/entities/achievement";
import { Award, Coins } from "lucide-react";
import { memo } from "react";

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
					<Award className="w-5 h-5 text-[#00f0ff]" />
					{sectionTitle}
				</h3>
				<div className="-mx-4 rounded-none overflow-hidden space-y-0">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-[72px] w-full rounded-none border-y border-[#00f0ff]/10" />
					))}
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-2">
			<h3 className="text-lg font-semibold text-white flex items-center gap-2">
				<Award className="w-5 h-5 text-[#00f0ff]" />
				{sectionTitle}
			</h3>
			<Accordion type="single" collapsible className="-mx-4 rounded-none overflow-hidden border-y border-[#00f0ff]/15">
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

	return (
		<AccordionItem
			value={achievement.slug ?? achievement.name}
			className="border-y border-[#00f0ff]/15 bg-[#16161d] first:border-t-0"
		>
			<AccordionTrigger className="flex w-full items-center hover:no-underline py-0 px-4 [&[data-state=open]>svg]:rotate-180">
				<div className="flex flex-1 min-w-0 items-center gap-3 py-3 pr-3 text-left">
					<div
						className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
							unlocked ? "bg-[#ffd700]/15" : "bg-white/5"
						}`}
					>
						<Award
							className={`w-5 h-5 shrink-0 ${unlocked ? "text-[#ffd700]" : "text-gray-500"}`}
						/>
					</div>
					<div className="min-w-0 flex-1">
						<p
							className={`font-medium truncate ${
								unlocked ? "text-white" : "text-gray-500"
							}`}
						>
							{achievement.badge ? `${achievement.badge} ` : ""}{achievement.name}
						</p>
						<p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
							{achievement.label ?? (unlocked ? "Получено" : progress)}
						</p>
					</div>
				</div>
			</AccordionTrigger>
			<AccordionContent className="p-4 pt-2 border-t border-[#00f0ff]/10">
				<div className="space-y-3 text-sm">
					<p className="text-white text-sm">{achievement.description}</p>
					<div>
						<p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Прогресс</p>
						<p className="text-white">
							{unlocked ? (
								<span className="text-[#ffd700]">Выполнено</span>
							) : (
								`${achievement.current_value} / ${achievement.threshold}`
							)}
						</p>
						{!unlocked && (
							<div className="mt-1.5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
								<div
									className="h-full rounded-full bg-[#00f0ff]/60 transition-all duration-300"
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
									<Coins className="w-4 h-4 text-[#ffd700]" />
									<span className="text-[#ffd700]">+{achievement.coin_reward} монет</span>
								</>
							) : (
								<span className="text-gray-500">Без награды</span>
							)}
						</p>
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
});
