/**
 * Типы ответов API бэкенда.
 * Соответствуют структурам res.json() в server/src/routes/.
 */

/** Стандартный ответ с ошибкой */
export interface ApiError {
	error: string;
}

// ——— Events API ———

export interface ApiMyRegistrationResponse {
	registration: {
		event: { id: string; title: string; event_date: string } | null;
		registered_at: string;
	} | null;
}

export interface ApiValidateCodeResponse {
	event: { id: string; title: string };
	teams?: readonly { id: string; name: string }[];
	alreadyRegistered: boolean;
	coinsReward: number;
}

export interface ApiRegistrationRow {
	telegram_id: number;
	registered_at: string;
	status: string;
	first_name: string | null;
	username: string | null;
	avatar_url: string | null;
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
	/** Монеты, начисленные победителю при подтверждении */
	winner_coins?: number;
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
	/** Количество посещённых мероприятий (user_stats.games_visited). */
	games_visited?: number;
	/** Количество покупок в магазине (user_stats.tickets_purchased). */
	tickets_purchased?: number;
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

/** Ответ превью кода покупки (товар, цена, баланс — без списания) */
export interface ApiPreviewPurchaseCodeResponse {
	item: { id: string; name: string; price: number };
	balance: number;
}

/** Ответ погашения кода покупки (без билета — только списание и инфо) */
export interface ApiRedeemPurchaseCodeResponse {
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

/** Типизированный парсинг JSON ответа */
export async function parseJson<T>(res: Response): Promise<T> {
	return res.json() as Promise<T>;
}
