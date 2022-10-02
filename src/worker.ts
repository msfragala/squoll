import { AvifEncoderOptions } from "@/codecs/avif/avif_enc";
import { expose } from "slother";
import { lazyEmscripten } from "./lib/lazy-emscripten";

const avif_dec = lazyEmscripten(() => import("@/codecs/avif/avif_dec"));
const avif_enc = lazyEmscripten(() => import("@/codecs/avif/avif_enc"));

const defaultAvifEncoderOptions = {
  cqLevel: 33,
  cqAlphaLevel: -1,
  denoiseLevel: 0,
  tileColsLog2: 0,
  tileRowsLog2: 0,
  speed: 6,
  subsample: 1,
  chromaDeltaQ: false,
  sharpness: 0,
  tune: 0,
};

type Encoder<T> = (payload: {
  source: ImageData;
  options?: Partial<T>;
  wasmBinary: string;
}) => Promise<Uint8Array | null>;

type Decoder = (payload: {
  blob: File | Blob;
  wasmBinary: string;
}) => Promise<ImageData | null>;

export type SquollWorker = {
  decodeAvif: Decoder;
  encodeAvif: Encoder<AvifEncoderOptions>;
};

const worker: SquollWorker = {
  async decodeAvif({ blob, wasmBinary }) {
    const factory = await avif_dec();
    const codec = await factory(wasmBinary);
    const buffer = await blob.arrayBuffer();
    return codec.decode(buffer);
  },
  async encodeAvif({ source, options, wasmBinary }) {
    const factory = await avif_enc();
    const codec = await factory(wasmBinary);
    return codec.encode(
      source.data,
      source.width,
      source.height,
      Object.assign({}, defaultAvifEncoderOptions, options)
    );
  },
};

expose(worker);
