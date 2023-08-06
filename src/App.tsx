import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import to from './utils/to';
import './App.css';
import getGif from './utils/getGif';
import setGif from './utils/setGif';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #E9E3D6;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const RATIO = 0.856
const GifContainer = styled.div`
  width: 800px;
  height: calc(800px * ${RATIO});
  border: 1px solid black;
  margin: auto;
  max-width: 90vw;
  max-height: calc(90vw * ${RATIO});
`;

const OutputGif = styled.img`
  width: 100%;
`;

const clamp = (num: number, min: number, max: number): number =>
  num < min ? min
  : num > max ? max
  : num

const App: React.FC = () => {
  const [gameId, setGameId] = useState('212727');
  const [status, setStatus] = useState('');
  const [delay, setDelay] = useState(90)
  const [lastFrameRepeat, setLastFrameRepeat] = useState(3)
  const [error, setError] = useState('');

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setGameId(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));

  const handleDelayChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setDelay(parseInt(e.target.value, 10));

  const handleLastFrameChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setLastFrameRepeat(parseInt(e.target.value, 10));

  const begin = async () => {
    const clampedDelay = clamp(delay, 10, 300)
    const clampedLastFrameRepeat = clamp(lastFrameRepeat, 1, 10)
    setError('')
    setDelay(clampedDelay)
    setLastFrameRepeat(clampedLastFrameRepeat)
    setStatus('Fetching Images...');
    const [err, gif] = await to(getGif(gameId, setStatus, { delay: clampedDelay, lastFrameRepeat: clampedLastFrameRepeat }));
    if (err) console.log('Error:', err);
    if (err || !gif){
      (document.getElementById('outputGif') as HTMLImageElement).setAttribute('src' , '')
      setStatus('')
      return setError(err?.message || 'There was an error');}
    setGif(gif, document.getElementById('outputGif') as HTMLImageElement);
    setStatus('');
  };

  return (
    <>
      <GlobalStyle />
      <h1>Diplomacy GIF Generator</h1>
      <p>
        Game ID: <input type="text" value={gameId} onChange={handleChange} />
      </p>
      <p>
        Delay (ms): <input type="number" value={delay} min="10" max="300" onChange={handleDelayChange} />
      </p>
      <p>
        Repeat last frame <input type="number" value={lastFrameRepeat} min="1" max="10" onChange={handleLastFrameChange} /> times.
      </p>
      <button disabled={!!status} onClick={begin}>
        Submit
      </button>
      <p>{error}</p>
      <GifContainer>
        <OutputGif id="outputGif" />
        {status && <> {status} </>}
      </GifContainer>
    </>
  );
};

export default App;
