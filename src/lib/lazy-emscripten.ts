export function lazyEmscripten<T extends EmscriptenWasm.Module>(
  importModule: () => Promise<{ default: EmscriptenWasm.ModuleFactory<T> }>
) {
  let module: EmscriptenWasm.ModuleFactory<T>;
  return async () => {
    module ??= await importModule()
      .then((m) => m.default)
      .then((fn) => fn);
    return module;
  };
}
