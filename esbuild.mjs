import esbuild from "esbuild";
import { resolve } from "path";

/**
 * @type {import('esbuild').BuildOptions[]}
 */
const outputs = [
  {
    entryNames: "esm/[name]",
    format: "esm",
    target: "es2020",
  },
  {
    entryNames: "cjs/[name]",
    format: "cjs",
    target: "es6",
  },
];

outputs.forEach((output) => {
  esbuild.build({
    ...output,
    entryPoints: [resolve("src/squoll.ts"), resolve("src/worker.ts")],
    bundle: true,
    minify: true,
    platform: "browser",
    outdir: "dist",
    watch: process.argv.includes("-w"),
  });
});
