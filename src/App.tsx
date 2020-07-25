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

const GifContainer = styled.div`
  width: 800px;
  height: 800px;
  border: 1px solid black;
  margin: auto;

  @media (only screen and (max-width: 767px)) {
    width: 80vw;
    height: 80vw;
  }
`;

const OutputGif = styled.img`
  width: 100%;
`;

const App: React.FC = () => {
  const [gameId, setGameId] = useState('176578');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setGameId(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));

  const begin = async () => {
    setStatus('Fetching Images...');
    const [err, gif] = await to(getGif(gameId, setStatus, { delay: 90, lastFrameRepeat: 3 }));
    if (err) console.log('Error:', err);
    if (err || !gif) return setError(err?.message ?? 'There was an error');
    setGif(gif, document.getElementById('outputGif') as HTMLImageElement);
    setStatus('');
  };

  return (
    <>
      <GlobalStyle />
      <h1>Diplomacy GIF Generator</h1>
      Game ID: <input type="text" value={gameId} onChange={handleChange} />
      <button disabled={!!status} onClick={begin}>
        Submit
      </button>
      {error}
      <GifContainer>
        <OutputGif id="outputGif" />
        {status && <> {status} </>}
      </GifContainer>
    </>
  );
};

export default App;
