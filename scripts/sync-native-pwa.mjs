// Copies the PWA install/offline files into native-public so the sub-path
// GitHub Pages shell (and Capacitor) can serve the manifest, icons and
// service worker from the same directory as index.html. These are deployment
// copies, not brand evidence, so they stay out of the checksum ledger.
//
// The manifest is rewritten to relative paths because the Pages site lives at
// a sub-path (/mili-beads-play/) where root-absolute "/" URLs would 404.
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const plainCopies = ["sw.js", "app-icon-192.png", "app-icon-512.png", "apple-touch-icon.png"];

for (const file of plainCopies) {
  await copyFile(join(root, "public", file), join(root, "native-public", file));
}

const manifest = JSON.parse(await readFile(join(root, "public/manifest.webmanifest"), "utf8"));
manifest.start_url = "./";
manifest.scope = "./";
manifest.icons = manifest.icons.map(icon => ({ ...icon, src: icon.src.replace(/^\//, "./") }));
await writeFile(join(root, "native-public/manifest.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`synced ${plainCopies.length + 1} PWA files to native-public (manifest rewritten to relative paths)`);
