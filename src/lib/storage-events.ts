import { http } from '@/http';

const EVENT_PHOTOS_BUCKET = 'event-photos';
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MiB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadEventPhotoResult {
  path: string;
  publicUrl: string;
}

/**
 * Загружает обложку мероприятия в storage (бакет event-photos) и возвращает публичный URL.
 */
export async function uploadEventPhoto(file: File): Promise<UploadEventPhotoResult> {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Размер файла не должен превышать 5 МБ');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Допустимые форматы: JPEG, PNG, WebP');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { data, error } = await http.storage.from(EVENT_PHOTOS_BUCKET).upload(name, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    throw new Error(error.message || 'Ошибка загрузки фото');
  }

  const {
    data: { publicUrl },
  } = http.storage.from(EVENT_PHOTOS_BUCKET).getPublicUrl(data.path);

  return { path: data.path, publicUrl };
}
