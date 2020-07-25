import { MagickFile, MagickOutputFile } from 'wasm-imagemagick';

const setGif = (imageData: MagickFile, HTMLElement: HTMLImageElement | null): void => {
  if (!HTMLElement) return;
  const img = imageData as MagickOutputFile;
  const blob = new Blob([img.buffer as ArrayBuffer], {type: 'image/gif'});
  const objectURL = URL.createObjectURL(blob);
  HTMLElement.src = objectURL;
};

export default setGif;
