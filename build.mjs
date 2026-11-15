import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const dist=resolve(root,'source');
const repo=root;
const docs=resolve(repo,'docs');
await mkdir(docs,{recursive:true});
const mime={'.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const cache=new Map();
async function data(path){if(!cache.has(path))cache.set(path,`data:${mime[extname(path)]};base64,${(await readFile(resolve(dist,path))).toString('base64')}`);return cache.get(path);}
async function inlineCss(path){let css=await readFile(resolve(dist,path),'utf8');for(const match of [...css.matchAll(/url\(['"]?(assets\/[^)'"\s]+)['"]?\)/g)])css=css.replace(match[0],`url('${await data(match[1])}')`);return css;}
for(const file of ['index.html','option-1.html','option-2.html']){
  let html=await readFile(resolve(dist,file),'utf8');
  html=html.replace(/<link\b[^>]*rel="preload"[^>]*>/g,'');
  for(const match of [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)])html=html.replace(match[0],`<style>${await inlineCss(match[1])}</style>`);
  const scripts=[];
  for(const match of [...html.matchAll(/<script src="([^"]+)" defer><\/script>/g)]){
    let js=await readFile(resolve(dist,match[1]),'utf8');
    js=js.replace(/(['"])(assets\/[^'"]+)\1/g,(_,quote,path)=>`document.querySelector('img[data-inline-asset="${path}"]').getAttribute('src')`);
    scripts.push(`<script>${js.replace(/<\/script/gi,'<\\/script')}</script>`);html=html.replace(match[0],'');
  }
  for(const match of [...html.matchAll(/<img\b[^>]*\bsrc="(assets\/[^"]+)"[^>]*>/g)]){
    let tag=match[0].replace(/\s+(srcset|sizes)="[^"]*"/g,'');
    tag=tag.replace(`src="${match[1]}"`,`data-inline-asset="${match[1]}" src="${await data(match[1])}"`);
    html=html.replace(match[0],tag);
  }
  html=html.replace('</body>',scripts.join('\n')+'</body>');
  await writeFile(resolve(docs,file),html);
}
const error=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Page not found — Noetic</title><style>@font-face{font-family:Cormorant;src:url('${await data('assets/cormorant-regular.woff2')}')}body{margin:0;background:#f7f5f1;color:#2a2b2a;font:22px/1.5 Cormorant,serif;min-height:100svh;display:grid;place-items:center}main{max-width:40ch;padding:40px 24px;text-align:center}h1{font-weight:400;font-size:48px;line-height:1.1}a{color:inherit;text-underline-offset:5px;display:inline-flex;align-items:center;min-height:44px}a:focus-visible{outline:2px solid;outline-offset:5px}</style></head><body><main><p>Noetic</p><h1>This page could not be found.</h1><p>Discover refined, feminine and distinctive pieces in the Noetic collection.</p><a href="https://noetic.sa/en">Visit Noetic</a></main></body></html>`;
await writeFile(resolve(docs,'404.html'),error);await writeFile(resolve(docs,'.nojekyll'),'');
console.log(JSON.stringify({repositoryDirectory:repo,pages:await readdir(docs),nonHtmlAssets:'embedded in HTML; no public image/font downloads',sizes:Object.fromEntries(await Promise.all(['index.html','option-1.html','option-2.html'].map(async name=>[name,(await readFile(resolve(docs,name))).length])))}));
