import { useSession } from "@/app/context/session";
import { Skeleton } from "@/components/ui/skeleton";
import { ClickableTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { IProfileAchievement } from "./_types";
import { Award } from "lucide-react";
import { memo } from "react";

/** Правая полоска: градиент по статусу (получено — золотой акцент, заблокировано — нейтральная) */
const STRIP_STYLE_UNLOCKED: React.CSSProperties = {
	background: "linear-gradient(180deg, #ffd70040 0%, #ffd70010 50%, #ffd70020 100%)",
};
const STRIP_STYLE_LOCKED: React.CSSProperties = {
	background: "linear-gradient(180deg, #2a2a35 0%, #1e1e24 100%)",
};

interface Props {
	achievements: IProfileAchievement[];
}

export const ProfileAchievements = memo(({ achievements }: Props) => {
	const { isProfilePending } = useSession();

	if (isProfilePending) {
		return (
			<section className="space-y-2">
				<h3 className="text-lg font-semibold text-white flex items-center gap-2">
					<Award className="w-5 h-5 text-[#00f0ff]" />
					Достижения
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
				Достижения
			</h3>
			<div className="-mx-4 rounded-none overflow-hidden">
				{achievements.map((achievement) => (
					<ProfileAchievement key={achievement.name} achievement={achievement} />
				))}
			</div>
		</section>
	);
});

const ProfileAchievement = memo(({ achievement }: { achievement: IProfileAchievement }) => {
	const unlocked = achievement.unlocked;

	return (
		<ClickableTooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					className="w-full flex rounded-none text-left bg-[#16161d] border-y border-[#00f0ff]/15 overflow-hidden min-h-[72px] active:opacity-90 transition-opacity"
				>
					{/* Основная часть */}
					<div className="flex-1 flex items-center gap-3 py-3 pl-4 pr-3 border-r border-dashed border-[#00f0ff]/20">
						<div
							className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
								unlocked ? "bg-[#ffd700]/15" : "bg-white/5"
							}`}
						>
							<Award
								className={`w-5 h-5 ${unlocked ? "text-[#ffd700]" : "text-gray-500"}`}
							/>
						</div>
						<div className="min-w-0 flex-1">
							<p
								className={`font-medium truncate ${
									unlocked ? "text-white" : "text-gray-500"
								}`}
							>
								{achievement.name}
							</p>
							<p className="text-xs text-gray-500 mt-0.5">
								{unlocked ? "Получено" : "Заблокировано"}
							</p>
						</div>
					</div>
					{/* Акцентная полоска по статусу */}
					<div
						className="w-9 shrink-0 border-l border-[#00f0ff]/10"
						style={unlocked ? STRIP_STYLE_UNLOCKED : STRIP_STYLE_LOCKED}
						aria-hidden
					/>
				</button>
			</TooltipTrigger>
			<TooltipContent
				side="bottom"
				style={{
					// @ts-expect-error CSS variable for tooltip
					"--foreground": unlocked ? "#1a1a22" : "#16161d",
				}}
				className="border-[#00f0ff]/20 bg-[#16161d]"
			>
				<p className="text-sm text-white">{achievement.description}</p>
			</TooltipContent>
		</ClickableTooltip>
	);
});
