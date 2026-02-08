
// export function Shop() {
// 	return (
// 		<div className="p-4 space-y-6">
// 			<h2 className="text-2xl mb-4 text-transparent bg-clip-text bg-linear-to-r from-neon-cyan to-neon-purple">
// 				Магазин
// 			</h2>

// 			<div className="space-y-4">
// 				{/* Начисление монет */}
// 				<div className="bg-surface-card rounded-2xl p-6 border border-neon-cyan/20">
// 					<div className="flex items-center gap-4 mb-4">
// 						<div className="w-12 h-12 rounded-xl bg-linear-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
// 							<TrendingUp className="w-6 h-6 text-white" />
// 						</div>
// 						<div className="flex-1">
// 							<h3 className="text-lg text-white font-semibold">Начисление монет</h3>
// 							<p className="text-sm text-gray-400">Отсканируйте QR код для начисления 10 монет</p>
// 						</div>
// 					</div>
// 					<div className="flex justify-center">
// 						<QRGenerator type="add" amount={10} />
// 					</div>
// 				</div>

// 				{/* Снятие монет */}
// 				<div className="bg-surface-card rounded-2xl p-6 border border-neon-purple/20">
// 					<div className="flex items-center gap-4 mb-4">
// 						<div className="w-12 h-12 rounded-xl bg-linear-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
// 							<TrendingDown className="w-6 h-6 text-white" />
// 						</div>
// 						<div className="flex-1">
// 							<h3 className="text-lg text-white font-semibold">Снятие монет</h3>
// 							<p className="text-sm text-gray-400">Отсканируйте QR код для снятия 10 монет</p>
// 						</div>
// 					</div>
// 					<div className="flex justify-center">
// 						<QRGenerator type="subtract" amount={10} />
// 					</div>
// 				</div>
// 			</div>
// 		</div>
// 	);
// }