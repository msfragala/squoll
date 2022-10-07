# Squoll 🌀

Convert and resize images directly in the browser, via lazy-loaded web worker pools ✨

### Features

- 🤯 Works directly in the process
- 🥯 Convert images to AVIF, JPEG, PNG, and WebP
- ↔️ Resize images to any width or height
- 🔥 Processes images in multiple background threads for faster output
- 🦥 Lazy-loads workers only once needed
- ✨ Written in TypeScript

## Installation

```
npm install --save squoll
```
```
pnpm add squoll
```
```
yarn add squoll
```

## Usage

### Setup

Squoll uses web workers to offload image processing to background threads and WASM binaries to run image codecs in the browsers. Both the web worker script and each WASM binary need to be imported as static assets so that you can provide Squoll the URL of each. Frontend build tools each handle static assets differently, so setup varies across tools and is somewhat verbose.

<details open>
<summary>&nbsp;<h4>Setup in Vite</h4></summary>

```js
import { Squoll } from 'squoll';
// Import the web worker script as a static asset using the URL hint
import workerURL from "squoll/worker?url";
// Import each of the wasm binaries as static assets using the URL hint
import avif_dec from "squoll/codecs/avif_dec.wasm?url";
import avif_enc from "squoll/codecs/avif_enc.wasm?url";
import mozjpeg_dec from "squoll/codecs/mozjpeg_dec.wasm?url";
import mozjpeg_enc from "squoll/codecs/mozjpeg_enc.wasm?url";
import resize_bg from "squoll/codecs/resize_bg.wasm?url";
import oxipng_bg from "squoll/codecs/oxipng_bg.wasm?url";
import png_bg from "squoll/codecs/png_bg.wasm?url";
import webp_dec from "squoll/codecs/webp_dec.wasm?url";
import webp_enc from "squoll/codecs/webp_enc.wasm?url";

export const squoll = new Squoll({
  worker: () => new Worker(workerURL),
  wasmBinaries: {
    avif_dec,
    avif_enc,
    mozjpeg_dec,
    mozjpeg_enc,
    webp_dec,
    webp_enc,
    oxipng_bg,
    png_bg,
    resize_bg,
  },
});
```

</details>

### Decoding images

```js
// Decode files and blobs into something encoders can ingest
const imageData = await squoll.decode(fileOrBlob);
```

### Resizing images

```js
// Resize an image to a specific width and Squoll will infer the target height
const w200 = await squoll.resize({ source: imageData, width: 200 });

// Resize an image to a specific height and Squoll will infer the target wdith
const h200 = await squoll.resize({ source: imageData, height: 200 });

// Or resize to a specific width AND height if needed
const w200h200 = await squoll.resize({ source: imageData, width: 200, height: 200 });
```

### Encoding images

```js
// Convert an image to AVIF
const blob = await squoll.encode({ source: imageData, type: 'image/avif' });

// Convert an image to JPEG
const blob = await squoll.encode({ source: imageData, type: 'image/jpeg' });

// Convert an image to PNG
const blob = await squoll.encode({ source: imageData, type: 'image/png' });

// Convert an image to WebP
const blob = await squoll.encode({ source: imageData, type: 'image/webp' });
```

## Credit
All codecs are taken directly from [Squoosh](https://github.com/GoogleChromeLabs/squoosh).
