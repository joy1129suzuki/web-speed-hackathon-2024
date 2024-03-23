type Params = {
  format?: 'avif' | 'webp' | 'png' | 'jpg' | 'jxl'; // formatはオプショナルに変更
  height?: number;
  imageId: string;
  width?: number;
};

const urlCache = new Map<string, string>();

export function getImageUrl({ format = 'avif', height, imageId, width }: Params): string { // デフォルトフォーマットをavifに設定
  const cacheKey = `${imageId}-${format}-${width}-${height}`;
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey);
  }

  const url = new URL(`/images/${imageId}`, location.href);
  url.searchParams.set('format', format);
  if (width != null) {
    url.searchParams.set('width', `${width}`);
  }
  if (height != null) {
    url.searchParams.set('height', `${height}`);
  }

  const urlString = url.href;
  urlCache.set(cacheKey, urlString);
  return urlString;
}
