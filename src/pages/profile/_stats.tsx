import { memo, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import type { IProfileStats } from './_types';

interface Props {
	stats: IProfileStats[];
}

export const ProfileStats = memo(({ stats }: Props) => {
	return <div className="grid grid-cols-2 gap-3">
		{stats.map((stat) => {
			return <ProfileStat key={stat.label} stat={stat} />;
		})}
	</div>;
});

const ProfileStat = memo(({ stat }: { stat: IProfileStats; }) => {
	const Icon = stat.icon;
	const [open, setOpen] = useState(false);
	return (
		<Tooltip key={stat.label} open={open} onOpenChange={setOpen}>
			<TooltipTrigger
				onClick={() => setOpen(true)}
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
		</Tooltip>
	);
});