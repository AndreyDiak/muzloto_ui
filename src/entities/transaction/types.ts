export type TransactionType = 'add' | 'subtract';

export interface TransactionQRData {
  type: TransactionType;
  amount: number;
  token: string; // Уникальный токен для безопасности
  expiresAt: number; // Timestamp истечения
}

export interface TransactionRequest {
  token: string;
  amount: number;
  type: TransactionType;
}
