// Baut www/ aus src/app.html: gleiche App wie im Browser, aber komplett offline
// (pdf.js und Schriften lokal statt vom CDN).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';

const out = 'www';
rmSync(out, { recursive: true, force: true });
mkdirSync(`${out}/lib`, { recursive: true });
mkdirSync(`${out}/fonts`, { recursive: true });

const pdfjs = 'node_modules/pdfjs-dist/build';
copyFileSync(`${pdfjs}/pdf.min.js`, `${out}/lib/pdf.min.js`);
copyFileSync(`${pdfjs}/pdf.worker.min.js`, `${out}/lib/pdf.worker.min.js`);
copyFileSync('node_modules/@supabase/supabase-js/dist/umd/supabase.js', `${out}/lib/supabase.js`);
copyFileSync('src/config.js', `${out}/config.js`);
mkdirSync(`${out}/icons`, { recursive: true });
for (const f of ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png']) copyFileSync(`assets/${f}`, `${out}/icons/${f}`);
copyFileSync('src/manifest.webmanifest', `${out}/manifest.webmanifest`);

const fonts = [
  ['Atkinson Hyperlegible', 400, 'atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff2'],
  ['Atkinson Hyperlegible', 700, 'atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff2'],
  ['Bricolage Grotesque', 600, 'bricolage-grotesque/files/bricolage-grotesque-latin-600-normal.woff2'],
  ['Bricolage Grotesque', 800, 'bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff2'],
  ['Literata', 400, 'literata/files/literata-latin-400-normal.woff2'],
  ['Literata', 700, 'literata/files/literata-latin-700-normal.woff2'],
  ['Lexend', 400, 'lexend/files/lexend-latin-400-normal.woff2'],
  ['Lexend', 700, 'lexend/files/lexend-latin-700-normal.woff2'],
  ['Nunito', 400, 'nunito/files/nunito-latin-400-normal.woff2'],
  ['Nunito', 700, 'nunito/files/nunito-latin-700-normal.woff2'],
];
const faces = fonts.map(([family, weight, path]) => {
  const file = path.split('/').pop();
  copyFileSync(`node_modules/@fontsource/${path}`, `${out}/fonts/${file}`);
  return `@font-face{font-family:"${family}";font-weight:${weight};font-style:normal;font-display:swap;src:url(fonts/${file}) format("woff2")}`;
}).join('\n');

let html = readFileSync('src/app.html', 'utf8');
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const replace = (from, to) => {
  if (!html.includes(from)) throw new Error(`Nicht gefunden in src/app.html: ${from.slice(0, 60)}`);
  html = html.split(from).join(to);
};
replace(`<script src="${CDN}pdf.min.js"></script>`, '<script src="lib/pdf.min.js"></script>\n<script src="lib/supabase.js"></script>\n<script src="config.js"></script>');
replace(`'${CDN}pdf.worker.min.js'`, "new URL('lib/pdf.worker.min.js', location.href).href");
html = html.replace(/<link rel="preconnect"[^>]*>\n/g, '');
html = html.replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, `<style>\n${faces}\n</style>`);

const head = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Lernbibliothek">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}*,*::before,*::after{box-sizing:border-box}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
`;
// <title>, <meta> und <style> der App gehören in den <head>, der Rest in den <body>.
const split = html.indexOf('<main');
// Service Worker nur in der Web-Version (nicht in der installierten App), damit sie offline startet.
const swReg = `<script>if (!window.Capacitor && 'serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});</script>`;
writeFileSync(`${out}/index.html`, head + html.slice(0, split) + '</head>\n<body>\n' + html.slice(split) + '\n' + swReg + '\n</body>\n</html>\n');

const shell = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'lib/pdf.min.js', 'lib/pdf.worker.min.js', 'lib/supabase.js',
  ...fonts.map(f => 'fonts/' + f[2].split('/').pop()), 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
writeFileSync(`${out}/sw.js`, readFileSync('src/sw.js', 'utf8')
  .replace('__VERSION__', String(Date.now()))
  .replace('__SHELL__', JSON.stringify(shell)));
console.log('www/ gebaut');
