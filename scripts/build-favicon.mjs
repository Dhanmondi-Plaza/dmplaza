import {readFile, writeFile} from 'node:fs/promises';
import sharp from 'sharp';

const source = new URL('../assets/dm-plaza-favicon-master.png', import.meta.url);
const publicDir = new URL('../public/', import.meta.url);
const master = await readFile(source);
const resize = (size) => sharp(master).resize(size, size).png().toBuffer();

const png32 = await resize(32);
const png48 = await resize(48);
await writeFile(new URL('favicon-32x32.png', publicDir), png32);
await writeFile(new URL('apple-touch-icon.png', publicDir), await resize(180));

// PNG-encoded images are supported inside ICO files by modern browsers.
const header = Buffer.alloc(6 + 16 * 2);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(2, 4);
let offset = header.length;
for (const [index, png, size] of [[0, png32, 32], [1, png48, 48]]) {
  const entry = 6 + index * 16;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(png.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += png.length;
}
await writeFile(new URL('favicon.ico', publicDir), Buffer.concat([header, png32, png48]));
