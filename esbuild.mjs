// @ts-check
import fs from "node:fs";
import { build } from "esbuild";

async function make() {
  const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));
  const [, , ...args] = process.argv;

  const watch = args.includes("--watch");

  build({
    outfile: "dist/index.mjs",
    entryPoints: ["./src/index.ts"],
    format: "esm",
    bundle: true,
    platform: "node",
    external: Object.keys(pkg.dependencies),
    watch,
    logLevel: "info",
    minify: !watch,
  });
}

make();
