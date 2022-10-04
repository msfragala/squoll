import esbuild from "esbuild";
import { resolve } from "path";
import pkg from "./package.json" assert { type: "json" };

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
    external: Object.keys(pkg.peerDependencies),
    bundle: true,
    minify: true,
    platform: "browser",
    outdir: "dist",
    watch: process.argv.includes("-w"),
  });
});
