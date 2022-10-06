import * as defaults from "@/lib/encoder-defaults";
import { expose } from "slother";
import { lazyEmscripten, lazyImport } from "@/lib/lazy-emscripten";
import type { AvifEncoderOptions } from "@/codecs/avif/enc";
import type { OxipngOptions } from "@/codecs/oxipng/oxipng";
import type { MozJpegEncoderOptions } from "@/codecs/mozjpeg/enc";
import type { WebpEncoderOptions } from "@/codecs/webp/enc";
import type { WasmBinaries } from "@/squoll";

const avif_dec = lazyEmscripten(() => import("@/codecs/avif/dec"));
const avif_enc = lazyEmscripten(() => import("@/codecs/avif/enc"));
const mozjpeg_dec = lazyEmscripten(() => import("@/codecs/mozjpeg/dec"));
const mozjpeg_enc = lazyEmscripten(() => import("@/codecs/mozjpeg/enc"));
const webp_dec = lazyEmscripten(() => import("@/codecs/webp/dec"));
const webp_enc = lazyEmscripten(() => import("@/codecs/webp/enc"));
const oxipng_bg = lazyImport(() => import("@/codecs/oxipng/oxipng"));
const png_bg = lazyImport(() => import("@/codecs/png/png"));
const resize_bg = lazyImport(() => import("@/codecs/resize/resize"));

type Encoder<T> = (payload: {
  source: ImageData;
  options?: Partial<T>;
  wasmBinaries: WasmBinaries;
}) => Promise<Blob | null>;

type Decoder = (payload: {
  blob: File | Blob;
  wasmBinaries: WasmBinaries;
}) => Promise<ImageData | null>;

export type SquollWorker = {
  decodeAvif: Decoder;
  decodeMozjpeg: Decoder;
  decodePng: Decoder;
  decodeWebp: Decoder;
  encodeAvif: Encoder<AvifEncoderOptions>;
  encodeMozjpeg: Encoder<MozJpegEncoderOptions>;
  encodeWebp: Encoder<WebpEncoderOptions>;
  encodePng: Encoder<OxipngOptions>;
  resize(payload: {
    source: ImageData;
    width?: number;
    height?: number;
    wasmBinaries: WasmBinaries;
  }): Promise<ImageData>;
};

const worker: SquollWorker = {
  async decodeAvif({ blob, wasmBinaries }) {
    const buffer = await blob.arrayBuffer();
    return avif_dec()
      .then((initCodec) => initCodec(wasmBinaries.avif_dec))
      .then((codec) => codec.decode(buffer));
  },
  async decodeMozjpeg({ blob, wasmBinaries }) {
    const buffer = await blob.arrayBuffer();
    return mozjpeg_dec()
      .then((initCodec) => initCodec(wasmBinaries.mozjpeg_dec))
      .then((codec) => codec.decode(buffer));
  },
  async decodeWebp({ blob, wasmBinaries }) {
    const buffer = await blob.arrayBuffer();
    return webp_dec()
      .then((initCodec) => initCodec(wasmBinaries.webp_dec))
      .then((codec) => codec.decode(buffer));
  },
  async decodePng({ blob, wasmBinaries }) {
    return png_bg().then(async (m) => {
      await m.default(wasmBinaries.png_bg);
      const buffer = await blob.arrayBuffer();
      return m.decode(new Uint8Array(buffer));
    });
  },
  async encodeAvif({ source, options, wasmBinaries }) {
    const init = await avif_enc();
    const codec = await init(wasmBinaries.avif_enc);
    const data = await codec.encode(
      source.data,
      source.width,
      source.height,
      Object.assign({}, defaults.avif, options)
    );
    if (!data) return null;
    return new Blob([data], { type: "image/avif" });
  },
  async encodeMozjpeg({ source, options, wasmBinaries }) {
    const init = await mozjpeg_enc();
    const codec = await init(wasmBinaries.mozjpeg_enc);
    const data = await codec.encode(
      source.data,
      source.width,
      source.height,
      Object.assign({}, defaults.mozjpeg, options)
    );
    if (!data) return null;
    return new Blob([data], { type: "image/jpeg" });
  },
  async encodeWebp({ source, options, wasmBinaries }) {
    const init = await webp_enc();
    const codec = await init(wasmBinaries.webp_enc);
    const data = await codec.encode(
      source.data,
      source.width,
      source.height,
      Object.assign({}, defaults.webp, options)
    );
    if (!data) return null;
    return new Blob([data], { type: "image/webp" });
  },
  async encodePng({ source, options, wasmBinaries }) {
    const pngCodec = await png_bg();
    await pngCodec.default(wasmBinaries.png_bg);
    const data = await pngCodec.encode(
      new Uint8Array(source.data.buffer),
      source.width,
      source.height
    );
    const oxipngCodec = await oxipng_bg();
    await oxipngCodec.default(wasmBinaries.oxipng_bg);
    const optimized = await oxipngCodec.optimise(
      data,
      options?.level ?? 2,
      options?.interlace ?? false
    );
    return new Blob([optimized], { type: "image/png" });
  },
  async resize({ source, width, height, wasmBinaries }) {
    if (!width && !height) return source;

    const codec = await resize_bg();
    await codec.default(wasmBinaries.resize_bg);

    width ??= (height! / source.height) * source.width;
    height ??= (width * source.height) / source.width;

    const data = await codec.resize(
      new Uint8Array(source.data.buffer),
      source.width,
      source.height,
      width,
      height,
      3,
      true,
      true
    );

    return new ImageData(data, width, height);
  },
};

expose(worker);
