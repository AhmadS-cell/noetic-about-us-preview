import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL((process.argv[2]||'./source/').replace(/\/?$/,'/'),import.meta.url);
for(const option of [1,2]){
  const file='option-'+option+'.html';
  const html=await readFile(new URL(file,root),'utf8');
  const markup=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
  assert(!/<header\b|class="[^"]*\bstore-(?:header|announcement)\b|Delivery within one day in Jeddah/i.test(markup),file+': removed store header or delivery banner returned');
  assert(!/class="[^"]*\bmotion-toggle\b|aria-label="(?:Pause|Resume) motion"/i.test(markup),file+': removed motion control returned');
  assert(!/(?:src|href)="(?:store-header\.css|header\.js)"/.test(markup),file+': unused header resources served');
  const bars=[...markup.matchAll(/<nav class="preview-bar"[^>]*>([\s\S]*?)<\/nav>/g)];
  assert.equal(bars.length,1,file+': one design-options bar expected');
  const bar=bars[0][1];
  assert(bar.includes('aria-current="page">Option '+option),file+': current option not identified');
  assert(bar.includes('href="option-'+(option===1?2:1)+'.html"'),file+': other option unavailable');
  assert(bar.includes('href="index.html">Compare'),file+': comparison link missing');
  assert.equal((bar.match(/<a\b/g)||[]).length,2,file+': unexpected top-bar link');
  assert(markup.includes('class="store-footer '),file+': original footer must remain');
  if(option===2)assert(!/Back to the portraits|Step inside our world/.test(markup),file+': previously removed hero links returned');
}
console.log(JSON.stringify({status:'pass',pages:2,top:'design options only',storeHeader:'removed',delivery:'removed',pause:'removed',footer:'retained'}));
