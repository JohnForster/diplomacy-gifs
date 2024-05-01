const path = require('path');
const express = require('express');
const stream = require('node:stream');

const app = express();

const publicPath = path.join(__dirname, '..', 'build');

const port = process.env.PORT || 3001;

app.use(express.static(publicPath));

const IDs = new Set();
const log = (id) => {
  if (!IDs.has(id)) {
    console.log('Generating gif for game:', id);
    IDs.add(id);
    setTimeout(() => {
      IDs.delete(id);
    }, 10_000);
  }
};

const buildURL = (id, season, phase, isFog) => {
  if (isFog) {
    // FOG URL: https://www.playdiplomacy.com/view_image.php?game_id=218254&gdate=1&current_phase=O&image_type=big_history
    const BASE_URL = 'https://www.playdiplomacy.com/view_image.php';
    const url = `${BASE_URL}?game_id=${id}&gdate=${season}&current_phase=${phase}&image_type=big_history`;
    return url;
  } else {
    // EXAMPLE URL: https://www.playdiplomacy.com/games/2/218759/game-history-218759-3-O.png
    const BASE_URL = 'https://www.playdiplomacy.com/games/2';
    const url = `${BASE_URL}/${id}/game-history-${id}-${season}-${phase}.png`;
    return url;
  }
};

app.use('/proxy/:id/:season/:phase', (req, res) => {
  const { id, season, phase } = req.params;
  log(id);

  const isFogOfWar = req.query['fog'] === 'true';
  const url = buildURL(id, season, phase, isFogOfWar);
  const slug = `${id}-${season}-${phase}`;

  fetch(url)
    .then((response) => {
      if (response.headers.get('content-type') !== 'image/png') {
        throw new Error('No Image Found');
      }

      res.set({
        'content-length': response.headers.get('content-length'),
        'content-disposition': `inline;filename="${slug}"`,
        'content-type': response.headers.get('content-type'),
      });
      stream.Readable.fromWeb(response.body).pipe(res);
    })
    .catch(() => {
      // Empty body so the frontend knows to discard.
      res.status(404).send();
    });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is up at port ${port}!`);
});
