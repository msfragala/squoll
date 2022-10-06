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

  async resize(source: ImageData, width: number, height: number) {
    return this.#pool.resize({
      source,
      width,
      height,
      wasmBinaries: this.#wasmBinaries,
    });
  }

  async encodeAvif(source: ImageData, options?: Partial<AvifEncoderOptions>) {
    return this.#pool.encodeAvif({
      source,
      options,
      wasmBinaries: this.#wasmBinaries,
    });
  }

  async encodeJpeg(
    source: ImageData,
    options?: Partial<MozJpegEncoderOptions>
  ) {
    return this.#pool.encodeMozjpeg({
      source,
      options,
      wasmBinaries: this.#wasmBinaries,
    });
  }

  async encodePng(source: ImageData) {
    return this.#pool.encodePng({
      source,
      wasmBinaries: this.#wasmBinaries,
    });
  }

  async encodeWebp(source: ImageData, options?: Partial<WebpEncoderOptions>) {
    return this.#pool.encodeWebp({
      source,
      options,
      wasmBinaries: this.#wasmBinaries,
    });
  }
}
