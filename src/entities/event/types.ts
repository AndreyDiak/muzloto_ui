export interface SEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location: string;
  location_href: string;
  price: number;
  max_participants?: number;
  /** Код мероприятия (5 цифр); есть только когда подставлен из таблицы codes (страница управления). В списке афиши не приходит. */
  code?: string;
  created_at: string;
  updated_at: string;
}
