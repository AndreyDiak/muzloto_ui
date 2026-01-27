import { getCSSVariable } from "@/lib/utils";
import { useMemo } from "react";

export function useCssColor(colorVars: string[]) {
	return useMemo(() => colorVars.map(varName => getCSSVariable(varName)), [colorVars]);
}