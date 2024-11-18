// This adjusts and copies all files from `dist` directory to my own
// website. It's not suitable for general purpose and needs to be
// changed accordingly to your own specific needs.

import { tryCatchAsync } from "@jordanhall/typeguard";
import { expandGlob } from "@std/fs";
import { join } from "@std/path";
import { Colors } from "./utils.ts";

if (!Deno.env.has("RAIONDEV_HOME")) {
  console.error(
    `%cRAIONDEV_HOME environment variable not exported`,
    Colors.Error,
  );
  Deno.exit(1);
}
const destPath = join(
  Deno.env.get("RAIONDEV_HOME")!,
  "src",
  "projects",
  "libs",
  "tokan",
);

const [errorReadingFiles, files] = await tryCatchAsync(() =>
  Array.fromAsync(expandGlob("**/*", { root: "./dist" }))
);
if (errorReadingFiles) {
  console.error(
    `%cUnable to read files: ${errorReadingFiles}`,
    Colors.Error,
  );
  Deno.exit(1);
}

for (const file of files) {
  const [errorCopyingFile] = await tryCatchAsync(() =>
    Deno.copyFile(file.path, join(destPath, file.name))
  );
  if (errorCopyingFile) {
    console.error(
      `%cUnable to copy file: ${errorReadingFiles}`,
      Colors.Error,
    );
    Deno.exit(1);
  }
}

const [errorReadingDoc, result] = await tryCatchAsync(() =>
  Deno.readTextFile("README.md")
);
if (errorReadingDoc) {
  console.error(
    `%cUnable to read documentation file: ${errorReadingFiles}`,
    Colors.Error,
  );
  Deno.exit(1);
}

const [errorWritingDoc] = await tryCatchAsync(() =>
  Deno.writeTextFile(
    join(destPath, "index.md"),
    [
      "---",
      "title: Project - Libraries - Tokan",
      "---",
      "",
      "# Projects / [Libraries](/projects/libs/) / Tokan.js",
      "",
      "",
    ].join("\n") + result.replace("# Tokan.js", ""),
  )
);
if (errorWritingDoc) {
  console.error(
    `%cUnable to write documentation file: ${errorReadingFiles}`,
    Colors.Error,
  );
  Deno.exit(1);
}

Deno.exit(0);
