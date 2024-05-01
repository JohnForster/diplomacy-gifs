import React, { useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import to from './utils/to';
import getGif from './utils/getGif';
import getObjectUrl from './utils/getObjectUrl';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #E9E3D6;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const RATIO = 0.856;
const GifContainer = styled.div`
  width: 800px;
  height: calc(800px * ${RATIO});
  border: 1px solid black;
  margin: auto;
  max-width: 90vw;
  max-height: calc(90vw * ${RATIO});
  margin-bottom: 100px;
  border-radius: 10px;
  overflow: hidden;
`;

const OutputGif = styled.img`
  width: 100%;
`;

const Button = styled.button`
  margin-right: 10px;
`;

const clamp = (num: number, min: number, max: number): number => (num < min ? min : num > max ? max : num);

type InputHandler = React.ChangeEventHandler<HTMLInputElement>;

const App: React.FC = () => {
  const [gameId, setGameId] = useState('218759');
  const [fog, setFog] = useState(false);
  const [status, setStatus] = useState('');
  const [delay, setDelay] = useState(90);
  const [lastFrameRepeat, setLastFrameRepeat] = useState(3);
  const [error, setError] = useState('');
  const [gifData, setGifData] = useState({ gameId: '', objectUrl: '' });
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const handleIdChange: InputHandler = (e) => setGameId(e.target.value.replace(/[^0-9]/g, ''));

  const handleDelayChange: InputHandler = (e) => setDelay(parseInt(e.target.value, 10));

  const handleLastFrameChange: InputHandler = (e) => setLastFrameRepeat(parseInt(e.target.value, 10));

  const handleFogChange: InputHandler = (e) => setFog(e.target.checked);

  const reset = () => {
    setStatus('');
    setError('');
    setGifData({ gameId: '', objectUrl: '' });
  };

  const begin = async () => {
    const clampedDelay = clamp(delay, 10, 300);
    const clampedLastFrameRepeat = clamp(lastFrameRepeat, 1, 10);
    setError('');
    setDelay(clampedDelay);
    setLastFrameRepeat(clampedLastFrameRepeat);
    setStatus('Fetching Images...');
    const gifData = {
      gameId,
      objectUrl: '',
    };
    const [err, gif] = await to(
      getGif(gameId, setStatus, { delay: clampedDelay, lastFrameRepeat: clampedLastFrameRepeat, fog }),
    );
    if (err) console.error(err);
    if (err || !gif) {
      (document.getElementById('outputGif') as HTMLImageElement).setAttribute('src', '');
      setStatus('');
      return setError(err?.message || 'There was an error');
    }
    gifData.objectUrl = getObjectUrl(gif);
    setGifData(gifData);
    setStatus('');
  };

  const download = () => {
    downloadRef.current?.click();
  };

  return (
    <>
      <GlobalStyle />
      <h1>Diplomacy GIF Generator</h1>
      <p>
        Game ID: <input type="text" value={gameId} onChange={handleIdChange} />
      </p>
      <p>
        Delay (ms): <input type="number" value={delay} min="10" max="300" onChange={handleDelayChange} />
      </p>
      <p>
        Repeat last frame{' '}
        <input type="number" value={lastFrameRepeat} min="1" max="10" onChange={handleLastFrameChange} /> times.
      </p>
      <p>
        Is fog of war game? <input type="checkbox" checked={fog} onChange={handleFogChange} />
      </p>
      <Button disabled={!!status || !!gifData.objectUrl} onClick={begin}>
        Submit
      </Button>
      <Button disabled={!gifData.objectUrl} onClick={download}>
        Download
      </Button>
      <Button disabled={!gifData.objectUrl} onClick={reset}>
        Reset
      </Button>
      {gifData.objectUrl && (
        <a hidden ref={downloadRef} href={gifData.objectUrl} download={`diplo_animated_${gifData.gameId}.gif`}>
          Download
        </a>
      )}
      <p>{error}</p>
      <GifContainer>
        <OutputGif id="outputGif" src={gifData.objectUrl} />
        {status && <> {status} </>}
      </GifContainer>
    </>
  );
};

export default App;
