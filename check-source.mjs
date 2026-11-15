import {readFile, readdir, access} from 'node:fs/promises';
import {resolve, dirname, basename} from 'node:path';
import {fileURLToPath} from 'node:url';
const root = fileURLToPath(new URL('./source', import.meta.url));
const errors = [];
let pages = 0, assets = 0, anchors = 0;
for (const file of await readdir(root)) {
  if (!file.endsWith('.html')) continue;
  pages++;
  const path = resolve(root,file), html = await readFile(path,'utf8');
  if (!/<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*\bnoindex\b/i.test(html)) errors.push(`${file}: missing noindex`);
  if (!/<html\s+lang="en"/.test(html)) errors.push(`${file}: missing English language`);
  if ((html.match(/<h1\b/g)||[]).length !== 1) errors.push(`${file}: expected one h1`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  if (new Set(ids).size!==ids.length) errors.push(`${file}: duplicate id`);
  for(const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    const ref=match[1];
    if (/^(https?:|data:|mailto:|tel:)/.test(ref)) continue;
    if (ref.startsWith('#')) {anchors++;if(!ids.includes(ref.slice(1)))errors.push(`${file}: missing anchor ${ref}`);continue;}
    assets++;
    try {await access(resolve(dirname(path),ref.split('#')[0]));}catch{errors.push(`${file}: missing ${ref}`);}
  }
  for(const image of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="[^"]*"/.test(image[0])) errors.push(`${file}: missing image alt`);
    if (!/\bwidth="\d+"/.test(image[0])||!/\bheight="\d+"/.test(image[0])) errors.push(`${file}: unreserved image geometry`);
  }
  if (/https?:[^"']+\.js(?:[?"'])/.test(html)) errors.push(`${file}: unexpected third-party script`);
  if (/[A-Z]:[\\/]|AppData|Downloads/.test(html)) errors.push(`${file}: local path leaked into served content`);
}
const css=await readFile(resolve(root,'styles.css'),'utf8');
for(const ref of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)){
  assets++;
  try{await access(resolve(root,ref[1]));}catch{errors.push(`CSS: missing ${ref[1]}`);}
}
if (!css.includes('prefers-reduced-motion')) errors.push('Missing reduced-motion support');
if (errors.length){console.error(errors.join('\n'));process.exitCode=1;}else{console.log(JSON.stringify({status:'pass',htmlPages:pages,localResourceReferences:assets,anchors,noindex:'all served source HTML',externalScripts:0}));}
