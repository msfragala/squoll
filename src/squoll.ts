import { Pool } from "slother";
import type { SquollWorker } from "@/worker";
import { AvifEncoderOptions } from "./codecs/avif/enc";
import { WebpEncoderOptions } from "./codecs/webp/enc";
import { MozJpegEncoderOptions } from "./codecs/mozjpeg/enc";

export type WasmBinaries = {
  avif_dec: string;
  avif_enc: string;
  mozjpeg_dec: string;
  mozjpeg_enc: string;
  oxipng_bg: string;
  png_bg: string;
  resize_bg: string;
  webp_dec: string;
  webp_enc: string;
};

type EncoderOptions = {
  "image/avif": Partial<AvifEncoderOptions>;
  "image/jpeg": Partial<MozJpegEncoderOptions>;
  "image/webp": Partial<WebpEncoderOptions>;
  "image/png": void;
};

export class Squoll {
  #pool: SquollWorker;
  #wasmBinaries: WasmBinaries;

  constructor(options: {
    worker: () => Promise<Worker>;
    wasmBinaries: WasmBinaries;
    maxThreads?: number;
    maxTasksPerThread?: number;
  }) {
    this.#wasmBinaries = options.wasmBinaries;
    this.#pool = Pool.proxy<SquollWorker>(options.worker, {
      maxConcurrentThreads: options.maxThreads,
      maxConcurrentMessages: options.maxTasksPerThread,
    });
  }

  async decode(blob: File | Blob) {
    const wasmBinaries = this.#wasmBinaries;
    switch (blob.type) {
      case "image/jpeg":
      case "image/jpg":
        return this.#pool.decodeMozjpeg({ blob, wasmBinaries });
      case "image/avif":
        return this.#pool.decodeAvif({ blob, wasmBinaries });
      case "image/webp":
        return this.#pool.decodeWebp({ blob, wasmBinaries });
      case "image/png":
        return this.#pool.decodePng({ blob, wasmBinaries });
      default:
        return null;
    }
  }

  async resize({
    source,
    width,
    height,
  }: {
    source: ImageData;
    width?: number;
    height?: number;
  }) {
    return this.#pool.resize({
      source,
      width,
      height,
      wasmBinaries: this.#wasmBinaries,
    });
  }

  async encode<T extends keyof EncoderOptions>({
    source,
    type,
    options,
  }: {
    source: ImageData;
    type: T;
    options?: EncoderOptions[T];
  }) {
    switch (type) {
      case "image/avif": {
        return this.#pool.encodeAvif({
          source: source,
          options: options as Partial<AvifEncoderOptions>,
          wasmBinaries: this.#wasmBinaries,
        });
      }
      case "image/jpeg": {
        return this.#pool.encodeMozjpeg({
          source,
          options: options as Partial<MozJpegEncoderOptions>,
          wasmBinaries: this.#wasmBinaries,
        });
      }
      case "image/png": {
        return this.#pool.encodePng({
          source,
          wasmBinaries: this.#wasmBinaries,
        });
      }
      case "image/webp": {
        return this.#pool.encodeWebp({
          source,
          options: options as Partial<WebpEncoderOptions>,
          wasmBinaries: this.#wasmBinaries,
        });
      }
      default:
        return null;
    }
  }
}
