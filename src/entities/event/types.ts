export interface SEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location: string;
  price: number;
  max_participants?: number;
  code: string;
  created_at: string;
  updated_at: string;
}
