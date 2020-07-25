import { MagickInputFile } from 'wasm-imagemagick';
let count = 0;

export async function buildInputFile(
  url: string,
  name: string = Math.random().toString().slice(0, 6) + '.png',
): Promise<MagickInputFile> {
  const allOriginUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  // const allOriginUrl = 'http://localhost:3000/testMap.png';
  const res = await fetch(allOriginUrl);
  if (!res.ok) return Promise.reject('Response was not ok');
  const fetchedSourceImage = res;
  const arrayBuffer = await fetchedSourceImage.arrayBuffer();
  if (count < 6000) {
    // console.log(fetchedSourceImage);
    // console.log(allOriginUrl);
  }
  if (!arrayBuffer.byteLength) return Promise.reject('No contents');
  const content = new Uint8Array(arrayBuffer);
  console.log(content);

  count++;
  return { name, content };
}
