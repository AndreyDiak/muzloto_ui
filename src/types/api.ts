/**
 * Типы ответов API бэкенда.
 * Соответствуют структурам res.json() в server/src/routes/.
 */

/** Стандартный ответ с ошибкой */
export interface ApiError {
	error: string;
}

// ——— Events API ———

export interface ApiEventTeam {
	id: string;
	name: string;
}

export interface ApiMyRegistrationResponse {
	registration: {
		event: { id: string; title: string } | null;
		team: ApiEventTeam | null;
		registered_at: string;
	} | null;
}

export interface ApiValidateCodeResponse {
	event: { id: string; title: string };
	teams: ApiEventTeam[];
	alreadyRegistered: boolean;
	coinsReward: number;
}

export interface ApiTeamsResponse {
	teams: ApiEventTeam[];
}

export interface ApiRegistrationRow {
	telegram_id: number;
	registered_at: string;
	status: string;
	first_name: string | null;
	username: string | null;
	avatar_url: string | null;
	team: { id: string; name: string | null } | null;
}

export interface ApiRegistrationsResponse {
	registrations: ApiRegistrationRow[];
}

/** Победитель розыгрыша (одна запись на мероприятие) */
export interface ApiRaffleWinner {
	telegram_id: number;
	first_name: string | null;
	username: string | null;
	avatar_url: string | null;
}

export interface ApiRaffleResponse {
	winner: ApiRaffleWinner | null;
	drawn_at?: string;
}

export interface ApiAwardCoinsResponse {
	success: true;
	newBalance: number;
	amount: number;
}

export interface ApiPrizeCodesResponse {
	code: string;
	id: string;
	created_at: string;
}

export interface ApiPersonalWinner {
	telegram_id: number;
	first_name: string | null;
	username: string | null;
	avatar_url: string | null;
	registered_at: string;
	status: string;
}

/** Информация о погашении кода */
export interface ApiPrizeCodeRedeemer {
	telegram_id: number;
	first_name: string | null;
	username: string | null;
	avatar_url: string | null;
}

/** Слот персонального победителя: пользователь, код (с опциональной инфой о погашении), или null */
export type ApiPersonalWinnerSlot =
	| ApiPersonalWinner
	| { code: string; redeemed: boolean; redeemed_at: string | null; redeemed_by: ApiPrizeCodeRedeemer | null }
	| null;

/** Слот командного победителя: команда, код (с опциональной инфой о погашении), или null */
export type ApiTeamWinnerSlot =
	| ApiEventTeam
	| { code: string; redeemed: boolean; redeemed_at: string | null; redeemed_by: ApiPrizeCodeRedeemer | null }
	| null;

export interface ApiBingoWinnersResponse {
	personal: ApiPersonalWinnerSlot[];
	team: ApiTeamWinnerSlot[];
}

export interface ApiPutBingoWinnersResponse {
	success: true;
}

// ——— Shared: newly unlocked achievement (matches server NewlyUnlockedAchievement) ———

export interface ApiNewlyUnlockedAchievement {
	slug: string;
	badge: string;
	name: string;
	description: string;
	label: string;
	coinReward?: number;
}

// ——— Bingo API ———

export interface ApiBingoClaimResponse {
	success: true;
	message: string;
	newBalance: number;
	coinsEarned: number;
	newlyUnlockedAchievements: ApiNewlyUnlockedAchievement[];
}

// ——— Achievements API ———

/** Элемент списка достижений, совпадает с AchievementWithUnlocked на бэкенде */
export interface ApiAchievementItem {
	slug: string;
	badge: string;
	name: string;
	description: string;
	label: string;
	stat_key: "games_visited" | "tickets_purchased" | "bingo_collected";
	unlocked: boolean;
	unlocked_at: string | null;
	reward_claimed_at: string | null;
	threshold: number;
	current_value: number;
	coin_reward: number | null;
}

export interface ApiAchievementsResponse {
	achievements: ApiAchievementItem[];
	/** Прогресс до награды за посещения (0–5). Вычисляется: games_visited - (visit_rewards_claimed * 5). При 5 — показывается кнопка «Забрать приз». */
	visit_reward_progress?: number;
	/** true: награда за 5 посещений готова, можно забрать кнопкой (когда visit_reward_progress >= 5). */
	visit_reward_pending?: boolean;
	/** Монет за приз за 5 посещений (для отображения на кнопке). */
	visit_reward_coins?: number;
}

export interface ApiClaimAchievementResponse {
	success: true;
	coinsAdded: number;
	newBalance: number;
}

export interface ApiClaimVisitRewardResponse {
	success: true;
	coinsAdded: number;
	newBalance: number;
}

// ——— Catalog API ———

export interface ApiCatalogItem {
	id: string;
	name: string;
	description: string | null;
	price: number;
	photo: string | null;
	created_at: string;
	updated_at: string;
}

export interface ApiCatalogResponse {
	items: ApiCatalogItem[];
}

export interface ApiPurchaseResponse {
	success: true;
	message: string;
	item: ApiCatalogItem;
	newBalance: number;
	newlyUnlockedAchievements?: ApiNewlyUnlockedAchievement[];
}

// ——— Event code (process-event-code) ———

export interface ApiProcessEventCodeResponse {
	success: true;
	message: string;
	event: { id: string; title: string };
	newBalance: number;
	coinsEarned: number;
	newlyUnlockedAchievements?: ApiNewlyUnlockedAchievement[];
}

// ——— Scanner API ———

export interface ApiScanTicketParticipant {
	telegram_id: number;
	username: string | null;
	first_name: string | null;
	avatar_url: string | null;
}

export interface ApiScanTicketResponse {
	success: true;
	participant: ApiScanTicketParticipant;
	item: ApiCatalogItem;
}

export interface ApiRecentScannedItem {
	id: string;
	used_at: string;
	code: string;
	participant: ApiScanTicketParticipant | null;
	item: ApiCatalogItem | null;
}

export interface ApiRecentScannedResponse {
	items: ApiRecentScannedItem[];
}

// ——— Personal Bingo Slots ———

export const PERSONAL_BINGO_SLOTS = [
	{ slug: "horizontal", label: "Горизонталь", rewardType: "personal_bingo_horizontal", icon: "MoveHorizontal", coins: 75 },
	{ slug: "vertical", label: "Вертикаль", rewardType: "personal_bingo_vertical", icon: "MoveVertical", coins: 75 },
	{ slug: "diagonal", label: "Диагональ", rewardType: "personal_bingo_diagonal", icon: "MoveUpRight", coins: 75 },
	{ slug: "full_card", label: "Весь бланк", rewardType: "personal_bingo_full_card", icon: "LayoutGrid", coins: 100 },
] as const;

export const TEAM_BINGO_SLOTS = [
	{ slug: "horizontal", label: "Горизонталь", rewardType: "team_bingo_horizontal", icon: "MoveHorizontal", coins: 150 },
	{ slug: "vertical", label: "Вертикаль", rewardType: "team_bingo_vertical", icon: "MoveVertical", coins: 150 },
	{ slug: "full_card", label: "Весь бланк", rewardType: "team_bingo_full_card", icon: "LayoutGrid", coins: 150 },
] as const;

export type BingoSlotDef = {
	slug: string;
	label: string;
	rewardType: string;
	icon: string;
	coins: number;
};

export interface ApiBingoConfigResponse {
	personal: BingoSlotDef[];
	team: BingoSlotDef[];
}

/** Типизированный парсинг JSON ответа */
export async function parseJson<T>(res: Response): Promise<T> {
	return res.json() as Promise<T>;
}
