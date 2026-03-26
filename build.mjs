import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, rmSync, existsSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { deflateSync } from 'zlib';

const isWatch = process.argv.includes('--watch');

// Clean dist
if (existsSync('dist')) rmSync('dist', { recursive: true });
mkdirSync('dist', { recursive: true });

// Build TypeScript entry points
const buildOptions = {
  entryPoints: [
    'src/content.ts',
    'src/background.ts',
    'src/popup/popup.ts',
    'src/options/options.ts',
  ],
  bundle: true,
  outdir: 'dist',
  outbase: 'src',
  format: 'iife',
  target: 'chrome120',
  minify: !isWatch,
  sourcemap: isWatch ? 'inline' : false,
  logLevel: 'info',
};

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(buildOptions);
}

// Copy static files
function copyFile(src, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
}

copyFile('manifest.json', 'dist/manifest.json');
copyFile('src/popup/popup.html', 'dist/popup/popup.html');
copyFile('src/popup/popup.css', 'dist/popup/popup.css');
copyFile('src/options/options.html', 'dist/options/options.html');
copyFile('src/options/options.css', 'dist/options/options.css');

// Generate PNG icons (solid indigo with white Q ring)
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type);
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([len, typeB, data, crcB]);
}

function createPNG(size) {
  const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB

  const rows = [];
  const cx = size / 2, cy = size / 2;
  const R = size * 0.38, iR = size * 0.23;

  for (let y = 0; y < size; y++) {
    const row = [0]; // filter byte
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const t = y / size;

      // White Q ring + tail on indigo gradient background
      if ((d <= R && d >= iR) || (dx > 0 && dy > 0 && dx < size * 0.18 && dy < size * 0.18 && d > iR * 0.6)) {
        row.push(255, 255, 255);
      } else {
        row.push(
          Math.round(99 + t * 40),
          Math.round(102 - t * 10),
          Math.round(241 - t * 30)
        );
      }
    }
    rows.push(Buffer.from(row));
  }

  const compressed = deflateSync(Buffer.concat(rows));
  return Buffer.concat([SIG, pngChunk('IHDR', ihdr), pngChunk('IDAT', compressed), pngChunk('IEND', Buffer.alloc(0))]);
}

mkdirSync('dist/icons', { recursive: true });
for (const size of [16, 48, 128]) {
  writeFileSync(`dist/icons/icon${size}.png`, createPNG(size));
}

console.log('\n✅ Build complete! Load dist/ as unpacked extension in chrome://extensions');
