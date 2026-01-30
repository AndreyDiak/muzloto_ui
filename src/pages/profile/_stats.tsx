import { useSession } from "@/app/context/session";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
import { memo } from "react";
import { ClickableTooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import type { IProfileStats } from './_types';

interface Props {
	stats: IProfileStats[];
}

export const ProfileStats = memo(({ stats }: Props) => {
	const { isLoading: isSessionLoading, isProfilePending } = useSession();
	const showSkeletons = isSessionLoading || isProfilePending;

	if (showSkeletons) {
		return (
			<section className="space-y-2">
				<h3 className="text-lg font-semibold text-white flex items-center gap-2">
					<BarChart3 className="w-5 h-5 text-[#00f0ff]" />
					Моя статистика
				</h3>
				<div className="grid grid-cols-2 gap-3">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-[88px] w-full rounded-xl" />
					))}
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-2">
			<h3 className="text-lg font-semibold text-white flex items-center gap-2">
				<BarChart3 className="w-5 h-5 text-[#00f0ff]" />
				Моя статистика
			</h3>
			<div className="grid grid-cols-2 gap-3">
				{stats.map((stat) => {
					return <ProfileStat key={stat.label} stat={stat} />;
				})}
			</div>
		</section>
	);
});

const ProfileStat = memo(({ stat }: { stat: IProfileStats; }) => {
	const Icon = stat.icon;
	return (
		<ClickableTooltip key={stat.label}>
			<TooltipTrigger
				className={`rounded-xl w-full p-4 border border-[#00f0ff]/10 ${stat.bgColor}`}
			>
				<div className="flex justify-between items-center mb-2">
					<p className="text-2xl mb-1" style={{ color: stat.textColor }}>
						{stat.value}
					</p>
					<Icon className="w-6 h-6 mb-2" style={{ color: stat.textColor }} />
				</div>
				<p className="text-xs text-gray-400 text-left">{stat.label}</p>
			</TooltipTrigger>
			<TooltipContent
				side="bottom"
				style={{
					// @ts-ignore
					"--foreground": stat.bgColor,
				}}
			>
				<p className="text-sm text-white">{stat.description}</p>
			</TooltipContent>
		</ClickableTooltip>
	);
});