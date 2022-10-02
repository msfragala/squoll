import { AvifEncoderOptions } from "@/codecs/avif/enc";
import { WebpEncoderOptions } from "@/codecs/webp/enc";
import { expose } from "slother";
import { lazyEmscripten } from "@/lib/lazy-emscripten";
import * as defaults from "@/lib/encoder-defaults";
import { MozJpegEncoderOptions } from "@/codecs/mozjpeg/enc";

const avif_dec = lazyEmscripten(() => import("@/codecs/avif/dec"));
const avif_enc = lazyEmscripten(() => import("@/codecs/avif/enc"));
const mozjpeg_dec = lazyEmscripten(() => import("@/codecs/mozjpeg/dec"));
const mozjpeg_enc = lazyEmscripten(() => import("@/codecs/mozjpeg/enc"));
const webp_dec = lazyEmscripten(() => import("@/codecs/webp/dec"));
const webp_enc = lazyEmscripten(() => import("@/codecs/webp/enc"));

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
  decodeMozjpeg: Decoder;
  decodeWebp: Decoder;
  encodeAvif: Encoder<AvifEncoderOptions>;
  encodeMozjpeg: Encoder<MozJpegEncoderOptions>;
  encodeWebp: Encoder<WebpEncoderOptions>;
};

const worker: SquollWorker = {
  async decodeAvif({ blob, wasmBinary }) {
    const buffer = await blob.arrayBuffer();
    return avif_dec()
      .then((initCodec) => initCodec(wasmBinary))
      .then((codec) => codec.decode(buffer));
  },
  async decodeMozjpeg({ blob, wasmBinary }) {
    const buffer = await blob.arrayBuffer();
    return mozjpeg_dec()
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
  async encodeMozjpeg({ source, options, wasmBinary }) {
    return mozjpeg_enc()
      .then((initCodec) => initCodec(wasmBinary))
      .then((codec) =>
        codec.encode(
          source.data,
          source.width,
          source.height,
          Object.assign({}, defaults.mozjpeg, options)
        )
      )
      .then((data) => {
        if (!data) return null;
        return new Blob([data], { type: "image/jpeg" });
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
