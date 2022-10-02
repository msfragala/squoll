export interface AvifDecoderModule extends EmscriptenWasm.Module {
  decode(data: BufferSource): ImageData | null;
}

declare var moduleFactory: EmscriptenWasm.ModuleFactory<AvifDecoderModule>;

export default moduleFactory;
