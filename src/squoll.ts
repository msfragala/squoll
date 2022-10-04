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
  webp_dec: string;
  webp_enc: string;
};

export class Squoll {
  #pool: SquollWorker;
  #wasmBinaries: WasmBinaries;

  constructor(options: {
    worker: () => Promise<Worker>;
    wasmBinaries: WasmBinaries;
  }) {
    this.#pool = Pool.proxy<SquollWorker>(options.worker);
    this.#wasmBinaries = options.wasmBinaries;
  }

  async decodeAvif(blob: File | Blob) {
    return this.#pool.decodeAvif({
      blob,
      wasmBinaries: this.#wasmBinaries,
    });
  }

  async decodeMozjpeg(blob: File | Blob) {
    return this.#pool.decodeMozjpeg({
      blob,
      wasmBinaries: this.#wasmBinaries,
    });
  }

  async decodePng(blob: File | Blob) {
    return this.#pool.decodePng({
      blob,
      wasmBinaries: this.#wasmBinaries,
    });
  }

  async decodeWebp(blob: File | Blob) {
    return this.#pool.decodeWebp({
      blob,
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

  async encodeMozjpeg(
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
