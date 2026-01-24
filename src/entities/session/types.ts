import type { TUser } from '../user/types';

export interface TSession {
  query_id?: string;
  user?: TUser;
  auth_date: number;
  hash: string;
  start_param?: string;
}
