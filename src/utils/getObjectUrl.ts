import { MagickFile, MagickOutputFile } from 'wasm-imagemagick';

const getObjectUrl = (imageData: MagickFile): string => {
  const img = imageData as MagickOutputFile;
  const blob = new Blob([img.buffer as ArrayBuffer], { type: 'image/gif' });
  const objectURL = URL.createObjectURL(blob);
  return objectURL;
};

export default getObjectUrl;
