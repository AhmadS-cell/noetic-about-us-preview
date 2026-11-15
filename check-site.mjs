import {readFile,readdir} from 'node:fs/promises';
const errors=[];let count=0;
for(const file of await readdir(new URL('./docs/',import.meta.url))){
  if(file==='.nojekyll')continue;
  if(!file.endsWith('.html')){errors.push(`Unexpected public non-HTML download: ${file}`);continue;}
  count++;const html=await readFile(new URL('./docs/'+file,import.meta.url),'utf8');
  if(!/<meta\b[^>]*name="robots"[^>]*content="[^\"]*noindex/.test(html))errors.push(`${file}: noindex missing`);
  if(/<script[^>]+src=|<link[^>]+rel="stylesheet"|<img[^>]+\bsrc="(?!data:)/.test(html))errors.push(`${file}: external asset`);
  for(const url of html.matchAll(/url\(([^)]+)\)/g))if(!url[1].replace(/^['"]|['"]$/g,'').startsWith('data:'))errors.push(`${file}: font/image URL not embedded`);
  if(/Disallow:\s*\//.test(html))errors.push(`${file}: crawl block prevents noindex access`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  for(const ref of html.matchAll(/href="#([^"]+)"/g))if(!ids.includes(ref[1]))errors.push(`${file}: missing anchor ${ref[1]}`);
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(JSON.stringify({status:'pass',htmlPages:count,noindex:'all HTML including404',publicNonHtmlDownloads:0}));
