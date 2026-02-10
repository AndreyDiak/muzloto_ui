import { useSession } from "@/app/context/session";
import { Accordion } from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router";
import { CatalogSection } from "./_catalog-section";
import { EventsSection } from "./_events-section";
import { GenerateCertSection } from "./_generate_cert";

export default function Admin() {
	const { isRoot, isSupabaseSessionReady } = useSession();

	if (!isSupabaseSessionReady) {
		return (
			<div className="p-4 flex items-center justify-center min-h-[200px]">
				<Loader2 className="w-8 h-8 animate-spin text-gray-400" />
			</div>
		);
	}

	if (!isRoot) {
		return <Navigate to="/" replace />;
	}

	return (
		<div className="p-4 pb-24 space-y-6">
			<h1 className="text-xl font-semibold text-white">Админка</h1>

			<Accordion type="multiple" defaultValue={["prize"]} className="space-y-2">
				<EventsSection />
				<CatalogSection />
				<GenerateCertSection />
			</Accordion>
		</div>
	);
}
