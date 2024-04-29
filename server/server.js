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

app.use('/proxy/:id/:season/:phase', (req, res) => {
  const { id, season, phase } = req.params;
  log(id);
  const BASE_URL = 'https://www.playdiplomacy.com/view_image.php';
  const url = `${BASE_URL}?game_id=${id}&gdate=${season}&current_phase=${phase}`;
  const slug = `${id}-${season}-${phase}`;

  fetch(url)
    .then((response) => {
      res.set({
        'content-length': response.headers.get('content-length'),
        'content-disposition': `inline;filename="${slug}"`,
        'content-type': response.headers.get('content-type'),
      });
      stream.Readable.fromWeb(response.body).pipe(res);
    })
    .catch(() => {
      res.status(404).send({ message: 'No image found' });
    });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const run = async () => {
  const response = await fetch('https://api.deezer.com/genre');

  const str = await response.text();

  console.log('response.headers:', JSON.stringify(response.headers, null, 2));
  console.log('response.status:', response.status);
  console.log(str);
};

app.listen(port, () => {
  console.log(`Server is up at port ${port}!`);
  run();
});
