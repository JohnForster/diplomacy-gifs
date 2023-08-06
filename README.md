# Diplomacy GIF Generator

This is a simple app to generate gifs from games of Diplomacy played on [playdiplomacy.com](https://playdiplomacy.com).

The app is hosted on Render, and can be found here: https://diplomacy-gifs.onrender.com/

The app is written in TypeScript and React, with a thin Express backend for proxying requests. The GIF generation is handled in-browser by a WASM build of ImageMagick.

To run a local version of the app:

`yarn && yarn build:prod && yarn start`
