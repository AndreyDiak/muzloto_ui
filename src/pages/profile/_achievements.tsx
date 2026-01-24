import { Award } from "lucide-react";
import { memo, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import type { IProfileAchievement } from "./_types";

interface Props {
	achievements: IProfileAchievement[];
}

export const ProfileAchievements = memo(({ achievements }: Props) => {
	return <div className="bg-[#16161d] rounded-2xl p-5 border border-[#b829ff]/20">
		<h3 className="text-lg mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#b829ff]">
			Достижения
		</h3>
		<div className="space-y-3">
			{achievements.map((achievement) => (
				<ProfileAchievement key={achievement.name} achievement={achievement} />
			))}
		</div>
	</div>;
});

const ProfileAchievement = memo(({ achievement }: { achievement: IProfileAchievement; }) => {
	const [open, setOpen] = useState(false);
	return (
		<Tooltip key={achievement.name} open={open} onOpenChange={setOpen}>
			<TooltipTrigger
				onClick={() => setOpen(true)}
				className={`flex items-center gap-3 p-3 w-full rounded-lg ${achievement.unlocked
					? 'bg-[#00f0ff]/10 border border-[#00f0ff]/20'
					: 'bg-[#0a0a0f]/50 border border-gray-800'
					}`}>
				<Award
					className={`w-5 h-5 ${achievement.unlocked ? 'text-[#ffd700]' : 'text-gray-600'
						}`}
				/>
				<span
					className={
						achievement.unlocked ? 'text-white' : 'text-gray-600'
					}
				>
					{achievement.name}
				</span>
			</TooltipTrigger>
			<TooltipContent side="bottom" style={{
				// @ts-ignore
				"--foreground": achievement.unlocked ? 'var(--accent-gold-darker)' : 'var(--accent-cyan-darker)',
			}}>
				<p className="text-sm text-white">{achievement.description}</p>
			</TooltipContent>
		</Tooltip>
	);
});