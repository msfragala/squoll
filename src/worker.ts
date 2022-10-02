import { AvifEncoderOptions } from "@/codecs/avif/avif_enc";
import { WebpEncoderOptions } from "@/codecs/webp/webp_enc";
import { expose } from "slother";
import { lazyEmscripten } from "@/lib/lazy-emscripten";
import * as defaults from "@/lib/encoder-defaults";

const avif_dec = lazyEmscripten(() => import("@/codecs/avif/avif_dec"));
const avif_enc = lazyEmscripten(() => import("@/codecs/avif/avif_enc"));
const webp_dec = lazyEmscripten(() => import("@/codecs/webp/webp_dec"));
const webp_enc = lazyEmscripten(() => import("@/codecs/webp/webp_enc"));

type Encoder<T> = (payload: {
  source: ImageData;
  options?: Partial<T>;
  wasmBinary: string;
}) => Promise<Blob | null>;

type Decoder = (payload: {
  blob: File | Blob;
  wasmBinary: string;
}) => Promise<ImageData | null>;

export type SquollWorker = {
  decodeAvif: Decoder;
  decodeWebp: Decoder;
  encodeAvif: Encoder<AvifEncoderOptions>;
  encodeWebp: Encoder<WebpEncoderOptions>;
};

const worker: SquollWorker = {
  async decodeAvif({ blob, wasmBinary }) {
    const buffer = await blob.arrayBuffer();
    return avif_dec()
      .then((initCodec) => initCodec(wasmBinary))
      .then((codec) => codec.decode(buffer));
  },
  async decodeWebp({ blob, wasmBinary }) {
    const buffer = await blob.arrayBuffer();
    return webp_dec()
      .then((initCodec) => initCodec(wasmBinary))
      .then((codec) => codec.decode(buffer));
  },
  async encodeAvif({ source, options, wasmBinary }) {
    return avif_enc()
      .then((initCodec) => initCodec(wasmBinary))
      .then((codec) =>
        codec.encode(
          source.data,
          source.width,
          source.height,
          Object.assign({}, defaults.avif, options)
        )
      )
      .then((data) => {
        if (!data) return null;
        return new Blob([data], { type: "image/avif" });
      });
  },
  async encodeWebp({ source, options, wasmBinary }) {
    return webp_enc()
      .then((initCodec) => initCodec(wasmBinary))
      .then((codec) =>
        codec.encode(
          source.data,
          source.width,
          source.height,
          Object.assign({}, defaults.webp, options)
        )
      )
      .then((data) => {
        if (!data) return null;
        return new Blob([data], { type: "image/webp" });
      });
  },
};

expose(worker);
