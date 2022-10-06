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
  import resize_bg from "squoll/codecs/resize_bg.wasm?url";
  import produce from "immer";
  import dashify from "dashify";

  let original;
  let results = {};

  const squoll = new Squoll({
    worker: () => new Worker(workerURL, { type: "module" }),
    wasmBinaries: {
      avif_dec,
      avif_enc,
      mozjpeg_dec,
      mozjpeg_enc,
      webp_dec,
      webp_enc,
      oxipng_bg,
      png_bg,
      resize_bg,
    },
  });

  async function onchange(event) {
    const file = event.target.files[0];
    if (!file) return;
    original = URL.createObjectURL(file);
    const decoded = await squoll.decode(file);

    if (!decoded) {
      console.log("!! decoding failed for", file);
    }

    results = {};

    const types = ["avif", "jpeg", "webp", "png"];
    const sizes = [{ w: 600 }, { h: 400 }, { w: 200, h: 100 }];

    types.forEach((type) => {
      sizes.forEach((size) => {
        const id = formatName(file.name, size.w, size.h, type);
        results = produce(results, (state) => {
          state[id] = { name: id, type: `image/${type}` };
        });

        squoll
          .resize(decoded, size.w, size.h)
          .then((data) => {
            if (type === "avif") return squoll.encodeAvif(data);
            if (type === "jpeg") return squoll.encodeJpeg(data);
            if (type === "webp") return squoll.encodeWebp(data);
            if (type === "png") return squoll.encodePng(data);
            throw new Error("No encoder matched");
          })
          .then((blob) => {
            results = produce(results, (state) => {
              if (!state[id] || !blob) return;
              state[id].url = URL.createObjectURL(blob);
              state[id].blob = blob;
            });
          });
      });
    });
  }

  function formatName(input, w, h, extension) {
    let name = input.match(/(.+)\.(jpeg|jpg|png|webp|avif)/)?.[1];
    name = dashify(name);
    if (w && h) name += `-${w}x${h}`;
    else if (w) name += `-${w}w`;
    else if (h) name += `-${h}h`;
    return `${name}.${extension}`;
  }
</script>

<input
  type="file"
  accept="image/jpeg, image/png, image/avif, image/webp"
  on:input={onchange}
/>

{#if original}
  <img src={original} height="400" alt="" />
{/if}

<div>
  {#each Object.values(results) as result}
    <p>
      <a href={result.url ?? ""} target="_blank">{result.name}</a>
      {result.blob ? "✓" : "⊘"}
      <details>
        <summary>See image</summary>
        <img loading="lazy" alt="" src={result.url} decoding="async" />
      </details>
    </p>
  {:else}
    No results
  {/each}
</div>
