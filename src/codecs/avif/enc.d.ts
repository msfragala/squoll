export const enum AVIFTune {
  auto,
  psnr,
  ssim,
}

export interface AvifEncoderOptions {
  cqLevel: number;
  denoiseLevel: number;
  cqAlphaLevel: number;
  tileRowsLog2: number;
  tileColsLog2: number;
  speed: number;
  subsample: number;
  chromaDeltaQ: boolean;
  sharpness: number;
  tune: AVIFTune;
}

export interface AvifEncoderModule extends EmscriptenWasm.Module {
  encode(
    data: BufferSource,
    width: number,
    height: number,
    options: AvifEncoderOptions
  ): Uint8Array | null;
}

declare var moduleFactory: EmscriptenWasm.ModuleFactory<AvifEncoderModule>;

export default moduleFactory;
