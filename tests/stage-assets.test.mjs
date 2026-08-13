import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const names = ["starship-cabin.webp", "cloud-post.webp", "candy-park.webp"];

test("all generated stage backdrops ship identically on web and native", async () => {
  const serviceWorker = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
  assert.match(serviceWorker, /mili-beads-v9/);
  for (const name of names) {
    const web = await readFile(new URL(`../public/stages/${name}`, import.meta.url));
    const native = await readFile(new URL(`../native-public/stages/${name}`, import.meta.url));
    assert.equal(createHash("sha256").update(web).digest("hex"), createHash("sha256").update(native).digest("hex"), `${name} must match across bundles`);
    const metadata = await sharp(web).metadata();
    assert.equal(metadata.width, 1024);
    assert.equal(metadata.height, 1024);
    assert.equal(metadata.format, "webp");
    assert.match(serviceWorker, new RegExp(`stages/${name.replace(".", "\\.")}`), `${name} must be precached`);
  }
});
