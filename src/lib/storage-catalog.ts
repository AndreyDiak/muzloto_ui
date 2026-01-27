import { http } from '@/http';

export const CATALOG_PHOTOS_BUCKET = 'catalog-photos';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MiB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface UploadCatalogPhotoResult {
  path: string;
  publicUrl: string;
}

/**
 * Загружает фото в бакет catalog-photos и возвращает публичный URL.
 * Путь: {itemId или uuid}/{оригинальное имя или timestamp.ext}
 */
export async function uploadCatalogPhoto(
  file: File,
  itemId?: string
): Promise<UploadCatalogPhotoResult> {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Размер файла не должен превышать 5 МБ');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Допустимые форматы: JPEG, PNG, WebP');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const path = itemId ? `${itemId}/${name}` : name;

  const { data, error } = await http.storage.from(CATALOG_PHOTOS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    throw new Error(error.message || 'Ошибка загрузки фото');
  }

  const {
    data: { publicUrl },
  } = http.storage.from(CATALOG_PHOTOS_BUCKET).getPublicUrl(data.path);

  return { path: data.path, publicUrl };
}
