// This generates a types definition file suitable to be used
// in developing userscripts.

import { tryCatchAsync } from "@jordanhall/typeguard";
import { join } from "@std/path";
import { Colors } from "./utils.ts";

const Paths = {
  dist: "./dist",
} as const;

const DtsBanners = {
  opening: [
    "declare global {",
  ],
  closing: [
    "}",
    "export {};",
  ],
} as const;

const [errorReadingTypes, dtsCode] = await tryCatchAsync(() =>
  Deno.readTextFile(join(Paths.dist, "tokan.d.ts"))
);
if (errorReadingTypes) {
  console.error(
    `%cUnable to read types definition code: ${errorReadingTypes}`,
    Colors.Error,
  );
  Deno.exit(1);
}

const fixedDTS = dtsCode
  .replace(/\s*declare\s*/g, "")
  .replace(/\s*export\s*{\s*.+\s*?}\s*;/g, "");
const [errorWritingFile] = await tryCatchAsync(() =>
  Deno.writeTextFile(
    join(Paths.dist, "tokan.d.ts"),
    `${DtsBanners.opening.join("\n")}\n${fixedDTS}\n${
      DtsBanners.closing.join("\n")
    }`,
  )
);
if (errorWritingFile) {
  console.error(
    `%cUnable to write types definition code: ${errorWritingFile}`,
    Colors.Error,
  );
  Deno.exit(1);
}

const [errorRenaming] = await tryCatchAsync(() =>
  Deno.rename(
    join(Paths.dist, "tokan.d.ts"),
    join(Paths.dist, "tokan.iife.d.ts"),
  )
);
if (errorRenaming) {
  console.error(
    `%cUnable to rename types definition code: ${errorWritingFile}`,
    Colors.Error,
  );
  Deno.exit(1);
}

console.log(`%cTypes definition fixing complete`, Colors.Success);

Deno.exit(0);
