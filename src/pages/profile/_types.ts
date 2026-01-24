import type { LucideIcon } from "lucide-react";

export interface IProfileStats {
	icon: LucideIcon;
	label: string;
	value: string;
	textColor: string;
	bgColor: string;
	description: string;
}

export interface IProfileAchievement {
	name: string;
	unlocked: boolean;
	description: string;
}