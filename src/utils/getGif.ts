import { execute, buildInputFile, MagickFile, MagickInputFile, MagickOutputFile } from 'wasm-imagemagick';

import to from './to';

import { NUMBER_OF_SEASONS, PHASES } from '../constants';

const seasonsArray = new Array(NUMBER_OF_SEASONS).fill(1).map((x, i) => i);

const getImage = async (
  id: string,
  seasonNumber: number,
  phase: 'O' | 'R' | 'B',
  i: number,
  fog: boolean,
): Promise<MagickInputFile | null> => {
  const url = `/proxy/${id}/${seasonNumber}/${phase}?fog=${fog}`;
  const seasonString = seasonNumber.toString().padStart(3, '0');

  const [err, image] = await to(buildInputFile(url, `${seasonString}-${i}.png`));

  const FALLBACK_IMAGE_BYTE_LENGTH = 18600;
  if (err || image?.content.byteLength === 0 || image?.content.byteLength === FALLBACK_IMAGE_BYTE_LENGTH) {
    return null;
  }
  if (image) {
    return image;
  }
  return null;
};

const getImages = async (id: string, fog: boolean) => {
  const promises = seasonsArray
    .map((seasonNumber) => {
      return PHASES.map((phase, i) => {
        const image = getImage(id, seasonNumber, phase, i, fog);
        return image;
      });
    })
    .flat();

  const results = await Promise.all(promises);
  const filteredResults = results.filter(Boolean);
  return filteredResults as MagickInputFile[];
};

const combine = async (
  inputFiles: MagickInputFile[],
  { delay, lastFrameRepeat }: { delay: number; lastFrameRepeat: number },
): Promise<MagickOutputFile> => {
  if (inputFiles.length === 0) return Promise.reject('No files passed to combine');
  const lastImageName = inputFiles[inputFiles.length - 1].name;
  const lastFrameDelay = delay * lastFrameRepeat;
  const outputName = 'output';

  const args = [
    'convert',
    `-delay ${delay}`,
    '-loop 0',
    '-layers Optimize',
    '-fuzz 5%',
    ...inputFiles.map((f) => f.name),
    `-delay ${lastFrameDelay} ${lastImageName}`,
    `${outputName}.gif`,
  ];
  const command = args.join(' ');

  const { outputFiles, exitCode } = await execute({
    inputFiles,
    commands: [command],
  });

  if (exitCode === 0) {
    return outputFiles[0];
  }
  return Promise.reject(`Something went wrong, exit code ${exitCode}.`);
};

interface Options {
  delay: number;
  lastFrameRepeat: number;
  fog: boolean;
}
const getGif = async (
  id: string,
  setStatus: (s: string) => void,
  { delay, lastFrameRepeat, fog }: Options,
): Promise<MagickFile> => {
  const inputFiles = await getImages(id, fog);
  if (!inputFiles.length) {
    throw new Error(`No images found for game ${id}`);
  }
  setStatus(`${inputFiles.length} images found. Combining images... \n (This may take a minute...)`);
  const [err, gif] = await to(combine(inputFiles, { delay, lastFrameRepeat }));
  if (err || !gif) {
    throw err || new Error('No gif for some reason');
  }
  return gif;
};

export default getGif;
