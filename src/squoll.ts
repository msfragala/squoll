import { Pool } from "slother";
import type { SquollWorker } from "@/worker";
import { AvifEncoderOptions } from "./codecs/avif/enc";
import { WebpEncoderOptions } from "./codecs/webp/enc";
import { MozJpegEncoderOptions } from "./codecs/mozjpeg/enc";

export class Squoll {
  #pool: SquollWorker;
  #wasmBinaries: ConstructorParameters<typeof Squoll>[0]["wasmBinaries"];

  constructor(options: {
    worker: () => Promise<Worker>;
    wasmBinaries: {
      avif_dec: string;
      avif_enc: string;
      mozjpeg_dec: string;
      mozjpeg_enc: string;
      webp_dec: string;
      webp_enc: string;
    };
  }) {
    this.#pool = Pool.proxy<SquollWorker>(options.worker);
    this.#wasmBinaries = options.wasmBinaries;
  }

  async decodeAvif(blob: File | Blob) {
    return this.#pool.decodeAvif({
      blob,
      wasmBinary: this.#wasmBinaries.avif_dec,
    });
  }

  async decodeMozjpeg(blob: File | Blob) {
    return this.#pool.decodeMozjpeg({
      blob,
      wasmBinary: this.#wasmBinaries.mozjpeg_dec,
    });
  }

  async decodeWebp(blob: File | Blob) {
    return this.#pool.decodeWebp({
      blob,
      wasmBinary: this.#wasmBinaries.webp_dec,
    });
  }

  async encodeAvif(source: ImageData, options?: Partial<AvifEncoderOptions>) {
    return this.#pool.encodeAvif({
      source,
      options,
      wasmBinary: this.#wasmBinaries.avif_enc,
    });
  }

  async encodeMozjpeg(
    source: ImageData,
    options?: Partial<MozJpegEncoderOptions>
  ) {
    return this.#pool.encodeMozjpeg({
      source,
      options,
      wasmBinary: this.#wasmBinaries.mozjpeg_enc,
    });
  }

  async encodeWebp(source: ImageData, options?: Partial<WebpEncoderOptions>) {
    return this.#pool.encodeWebp({
      source,
      options,
      wasmBinary: this.#wasmBinaries.webp_enc,
    });
  }
}
