import { Pool } from "slother";
import type { SquollWorker } from "@/worker";
import { AvifEncoderOptions } from "./codecs/avif/avif_enc";
import { WebpEncoderOptions } from "./codecs/webp/webp_enc";

export class Squoll {
  #pool: SquollWorker;
  #wasmBinaries: ConstructorParameters<typeof Squoll>[0]["wasmBinaries"];

  constructor(options: {
    worker: () => Promise<Worker>;
    wasmBinaries: {
      avif_dec: string;
      avif_enc: string;
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

  async encodeWebp(source: ImageData, options?: Partial<WebpEncoderOptions>) {
    return this.#pool.encodeWebp({
      source,
      options,
      wasmBinary: this.#wasmBinaries.webp_enc,
    });
  }
}
