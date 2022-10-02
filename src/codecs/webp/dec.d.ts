export interface WebpDecoderModule extends EmscriptenWasm.Module {
  decode(data: BufferSource): ImageData | null;
}

declare var moduleFactory: EmscriptenWasm.ModuleFactory<WebpDecoderModule>;

export default moduleFactory;
