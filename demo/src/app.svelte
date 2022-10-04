<script>
  import { Squoll } from "squoll";
  import workerURL from "squoll/worker?url";
  import mozjpeg_dec from "squoll/codecs/mozjpeg_dec.wasm?url";
  import mozjpeg_enc from "squoll/codecs/mozjpeg_enc.wasm?url";
  import avif_dec from "squoll/codecs/avif_dec.wasm?url";
  import avif_enc from "squoll/codecs/avif_enc.wasm?url";
  import webp_dec from "squoll/codecs/webp_dec.wasm?url";
  import webp_enc from "squoll/codecs/webp_enc.wasm?url";
  import oxipng_bg from "squoll/codecs/oxipng_bg.wasm?url";
  import png_bg from "squoll/codecs/png_bg.wasm?url";
  import produce from "immer";

  let files;
  let results = [];

  const squoll = new Squoll({
    worker: () => new Worker(workerURL),
    wasmBinaries: {
      avif_dec,
      avif_enc,
      mozjpeg_dec,
      mozjpeg_enc,
      webp_dec,
      webp_enc,
      oxipng_bg,
      png_bg,
    },
  });

  async function onchange(event) {
    const file = event.target.files[0];
    if (!file) return;

    const decoders = {
      "image/jpeg": "decodeMozjpeg",
      "image/jpg": "decodeMozjpeg",
      "image/avif": "decodeAvif",
      "image/webp": "decodeWebp",
      "image/png": "decodePng",
    };

    const decoded = await squoll[decoders[file.type]]?.(file);

    if (!decoded) {
      console.log("!! decoding failed for", file);
    }

    results = ["avif", "jpeg", "webp", "png"].map((type) => ({
      name: formatName(file.name, type),
      type: `image/${type}`,
    }));

    await Promise.all([
      squoll.encodeAvif(decoded).then(updateResult),
      squoll.encodeWebp(decoded).then(updateResult),
      squoll.encodeMozjpeg(decoded).then(updateResult),
      squoll.encodePng(decoded).then(updateResult),
    ]);
  }

  function formatName(input, extension) {
    const name = input.match(/(.+)\.(jpeg|jpg|png|webp|avif)/)?.[1];
    return `${name}.${extension}`;
  }

  function updateResult(blob) {
    results = produce(results, (state) => {
      const result = state.find((r) => r.type === blob.type);
      if (!result) return;
      result.url = URL.createObjectURL(blob);
      result.blob = blob;
    });
  }
</script>

<input
  type="file"
  accept="image/jpeg, image/png, image/avif, image/webp"
  bind:files
  on:input={onchange}
/>

<div>
  {#each results as result}
    <p>
      <a href={result.url ?? ""} target="_blank">{result.name}</a>
      {result.blob ? "✓" : "⊘"}
    </p>
  {:else}
    No results
  {/each}
</div>
