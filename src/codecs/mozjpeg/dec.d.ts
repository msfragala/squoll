export interface MozJpegDecoderModule extends EmscriptenWasm.Module {
  decode(data: BufferSource): ImageData | null;
}

declare var moduleFactory: EmscriptenWasm.ModuleFactory<MozJpegDecoderModule>;

export default moduleFactory;
