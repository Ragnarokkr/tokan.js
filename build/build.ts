import { tryCatchAsync } from "@jordanhall/typeguard";
import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import * as esbuild from "esbuild";
import { Colors } from "./utils.ts";

const Paths = {
  src: "./src",
  dist: "./dist",
} as const;

const IifeBanners = {
  opening: [
    "((_window) => {",
  ],
  closing: [
    "  _window.Tokan = Tokan;",
    "})(window);",
  ],
};

const [directoryCreationError] = await tryCatchAsync(() =>
  ensureDir(Paths.dist)
);
if (directoryCreationError) {
  console.error(
    `%cUnable to create dist directory: ${directoryCreationError}`,
    Colors.Error,
  );
  Deno.exit(1);
}

const [readCodeError, sourceCode] = await tryCatchAsync(() =>
  Deno.readTextFile(join(Paths.src, "tokan.ts"))
);
if (readCodeError) {
  console.error(`%cUnable to read source code: ${readCodeError}`, Colors.Error);
  Deno.exit(1);
}

const [transpileError, transpileResult] = await tryCatchAsync(
  () =>
    esbuild.transform(
      sourceCode as string,
      {
        loader: "ts",
        format: "esm",
        target: "esnext",
      },
    ),
);
if (transpileError) {
  console.error(
    `%cUnable to transpile source code: ${transpileError}`,
    Colors.Error,
  );
  Deno.exit(1);
}

const [writeCodeError] = await tryCatchAsync(() =>
  Deno.writeTextFile(
    join(Paths.dist, "tokan.js"),
    transpileResult!.code,
  )
);
if (writeCodeError) {
  console.error(
    `%cUnable to write transpiled code: ${writeCodeError}`,
    Colors.Error,
  );
  Deno.exit(1);
}
console.log(`%cTranspilation complete`, Colors.Success);

// This modifies the transpiled code to make it requireable from userscripts.

const strippedIIFE = transpileResult!.code.replace(
  /export\s*{\s*.+\s*?}\s*;/g,
  "",
);
const [iifeError] = await tryCatchAsync(() =>
  Deno.writeTextFile(
    join(Paths.dist, "tokan.iife.js"),
    `${IifeBanners.opening.join("\n")}\n${strippedIIFE}\n${
      IifeBanners.closing.join("\n")
    }`,
  )
);
if (iifeError) {
  console.error(
    `%cUnable to write IIFE transpiled code: ${iifeError}`,
    Colors.Error,
  );
  Deno.exit(1);
}
console.log(`%cIIFE transpilation complete`, Colors.Success);

Deno.exit(0);
