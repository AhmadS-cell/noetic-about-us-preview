import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const root = new URL((process.argv[2] || './source/').replace(/\/?$/, '/'), import.meta.url);
const original = JSON.parse(await readFile(new URL('./reference/original-header.json', import.meta.url), 'utf8'));
const entities = {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
const decode = text => text.replace(/&(amp|lt|gt|quot|apos|nbsp);/gi, (_,name)=>entities[name.toLowerCase()]);
function parse(html) {
  const tree={tag:'root',attrs:{},children:[]}, stack=[tree];
  const voidTags=new Set(['input','img','br','hr','meta','link','area','base','embed','param','source','track','wbr']);
  for(const token of html.matchAll(/<!--[\s\S]*?-->|<\/?([a-z][\w:-]*)\b([^<>]*?)\/?>|([^<]+)/gi)) {
    if(token[0].startsWith('<!--'))continue;
    if(token[3]!==undefined)continue;
    const tag=token[1].toLowerCase();
    if(token[0].startsWith('</')){const i=stack.findLastIndex(node=>node.tag===tag);if(i>0)stack.length=i;continue;}
    const attrs={};
    for(const match of token[2].matchAll(/([^\s=<>"'`/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s<>`]+)))?/g)) {
      const name=match[1].toLowerCase();assert(!(name in attrs),`Duplicate attribute ${name}`);
      attrs[name]=decode(match[2]??match[3]??match[4]??'');
    }
    const node={tag,attrs,children:[],parent:stack.at(-1)};stack.at(-1).children.push(node);
    if(!voidTags.has(tag)&&!token[0].endsWith('/>'))stack.push(node);
  }
  return tree;
}
const all = node => node.children.flatMap(child=>[child,...all(child)]);
const hasClass = (node,name) => (node.attrs.class||'').split(/\s+/).includes(name);
const geometryAttributes=new Set(['viewbox','d','cx','cy','r','rx','ry','x','y','x1','y1','x2','y2','points']);
const sessionPattern=/buyer_flags|consent_id|access_token|refresh_token|id_token|session_id|customer_id|authorization|password|jwt|signature/i;
// Public category artwork captured with the original header, plus fixture-pinned logos.
const approvedImageKeys=new Set([
  ...Object.keys(original.logoSHA256).map(file=>'assets/'+file),
  'assets/header-Category-08.jpg','assets/header-Category-05.jpg','assets/header-Category-04.jpg',
  'assets/header-abayas-1888474.png','assets/header-Category-09.jpg','assets/header-kids-kaftan-3473204.jpg'
]);
const headerMarker='Original Noetic navigation with native menu/search behavior for the static preview.';
const controllers=new Set();
function iconGeometry(node) {
  assert(node,'Missing original header icon control');
  return [node,...all(node)].filter(child=>['svg','path','circle','rect','line','ellipse','polyline','polygon'].includes(child.tag))
    .map(child=>({tag:child.tag,attributes:Object.fromEntries(Object.entries(child.attrs).filter(([name])=>geometryAttributes.has(name)))}));
}
const files=['option-1.html','option-2.html'];
for(const file of files) {
  const html=await readFile(new URL(file,root),'utf8');
  assert.equal((html.match(/<h1\b/gi)||[]).length,1,`${file}: logo must not introduce another h1`);
  const captures=[...html.matchAll(/<header(?=\s|>)[^>]*>[\s\S]*?<\/header\s*>/gi)];
  assert.equal(captures.length,1,`${file}: expected one store header`);
  const fragment=captures[0][0];
  assert(!/<script\b|<style\b|<link\b|<iframe\b|<object\b|<embed\b|<foreignObject\b/i.test(fragment),`${file}: unexpected active header markup`);
  // Random base64 bytes can spell "jwt" etc. Exclude only image-src payloads;
  // actual attribute names/values and navigable URL parameters are still checked below.
  const readableFragment=fragment.replace(/(\bsrc=(["'])data:image\/(?:svg\+xml|jpeg|png);base64,)[a-z\d+/=]+(?=\2)/gi,'$1[embedded-image-payload]');
  assert(!sessionPattern.test(readableFragment),`${file}: ephemeral/account data in header`);
  const tree=parse(fragment),nodes=all(tree),links=nodes.filter(node=>node.tag==='a');
  for(const node of nodes) for(const [name,value] of Object.entries(node.attrs)) {
    assert(!/^on/i.test(name),`${file}: inline event handler`);
    assert(!sessionPattern.test(name),`${file}: ephemeral credential attribute`);
    const embeddedImage=node.tag==='img'&&name==='src'&&value.startsWith('data:');
    if(!embeddedImage)assert(!sessionPattern.test(value),`${file}: ephemeral/account attribute value`);
    if(['href','src','action','xlink:href'].includes(name))assert(!/^\s*(javascript|vbscript):/i.test(value),`${file}: active URL`);
    if(['href','action','xlink:href'].includes(name)) {
      const url=new URL(value,'https://noetic.sa');
      assert(url.protocol==='https:'&&['https://noetic.sa','https://account.noeticsa.com'].includes(url.origin),`${file}: unapproved header navigation origin`);
      for(const [key,param] of url.searchParams)assert(!sessionPattern.test(key)&&!sessionPattern.test(param),`${file}: ephemeral URL parameter`);
    }
  }
  const collections=[...new Set(links.map(link=>link.attrs.href).filter(href=>/^https:\/\/noetic\.sa\/en\/collections\//.test(href)))].sort();
  assert.deepEqual(collections,original.collectionURLs,`${file}: original collection destinations changed`);
  const account=links.find(link=>link.attrs.href?.startsWith('https://account.noeticsa.com/'));
  assert(account,`${file}: missing original account destination`);
  const accountURL=new URL(account.attrs.href);
  assert.equal(accountURL.origin,'https://account.noeticsa.com');assert.equal(accountURL.pathname,'/');assert.equal(accountURL.hash,'');
  assert.deepEqual([...accountURL.searchParams.entries()].sort(),[['locale','en'],['region_country','SA']],`${file}: only stable verified account locale parameters allowed`);
  const cart=links.find(link=>link.attrs.id==='cart-icon');
  assert.equal(cart?.attrs.href,'https://noetic.sa/en/cart');assert(!cart.attrs.role&&!cart.attrs['aria-haspopup'],`${file}: cart link must navigate to real store`);
  assert(!nodes.some(node=>node.attrs.id==='cart-icon-bubble'),`${file}: no fabricated cart count`);
  const wishlist=links.filter(link=>hasClass(link,'store-wishlist'));
  assert.equal(wishlist.length,1,`${file}: missing/duplicate functional wishlist`);
  assert.equal(wishlist[0].attrs.href,'https://noetic.sa/en/pages/wishlist');assert(wishlist[0].attrs['aria-label'],`${file}: wishlist accessible name`);
  assert(!nodes.some(node=>hasClass(node,'gw-wl-header-icon-placeholder')),`${file}: unloaded wishlist placeholder remains`);
  const menu=nodes.find(node=>node.tag==='summary'&&hasClass(node,'main-menu__toggle'));
  assert.equal(menu?.parent.tag,'details',`${file}: native menu disclosure`);
  assert(menu.attrs['aria-controls']&&nodes.some(node=>node.attrs.id===menu.attrs['aria-controls']),`${file}: menu control destination`);
  const search=links.find(link=>hasClass(link,'js-show-search'));
  assert.equal(search?.attrs.href,'https://noetic.sa/en/search');
  const forms=nodes.filter(node=>node.tag==='form');assert.equal(forms.length,1,`${file}: one native search form`);
  assert.equal(forms[0].attrs.action,'https://noetic.sa/en/search');assert.equal(forms[0].attrs.method?.toLowerCase(),'get');
  const query=nodes.find(node=>node.tag==='input'&&node.attrs.name==='q');assert.equal(query?.attrs.type,'search');
  assert(!query.attrs.value&&!query.attrs.role&&!query.attrs['aria-autocomplete']&&!query.attrs['aria-controls']&&!query.attrs['aria-owns'],`${file}: native search, no stale predictive combobox`);
  assert(nodes.some(node=>node.tag==='label'&&node.attrs.for===query.attrs.id),`${file}: search label`);
  assert(nodes.some(node=>node.tag==='input'&&node.attrs.name==='options[prefix]'&&node.attrs.value==='last'),`${file}: original public search prefix field`);
  for(const [name,node] of Object.entries({menu,search,account,cart,wishlist:wishlist[0]}))assert.deepEqual(iconGeometry(node),original.iconGeometry[name],`${file}: original ${name} vector geometry changed`);
  const language=links.find(link=>link.attrs.id==='lang-switch');assert.equal(language?.attrs.href,'https://noetic.sa');
  const seenImageKeys=new Set();
  for(const image of nodes.filter(node=>node.tag==='img')) {
    const src=image.attrs.src;
    let key,bytes;
    if(src?.startsWith('data:')) {
      key=image.attrs['data-inline-asset'];
      assert(approvedImageKeys.has(key),`${file}: inline image needs an approved original source key`);
      const match=src.match(/^data:(image\/(?:svg\+xml|jpeg|png));base64,([a-z\d+/]+={0,2})$/i);
      assert(match,`${file}: invalid inline image encoding`);
      const expectedType=key.endsWith('.svg')?'image/svg+xml':key.endsWith('.png')?'image/png':'image/jpeg';
      assert.equal(match[1],expectedType,`${file}: inline asset MIME mismatch`);
      bytes=Buffer.from(match[2],'base64');
      assert(bytes.length&&bytes.toString('base64')===match[2],`${file}: invalid base64 image payload`);
      if(expectedType==='image/jpeg')assert(bytes[0]===255&&bytes[1]===216,`${file}: invalid JPEG payload`);
      if(expectedType==='image/png')assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',`${file}: invalid PNG payload`);
    } else {
      key=src;
      assert(approvedImageKeys.has(key),`${file}: header image must use original bundled artwork`);
      assert(!image.attrs['data-inline-asset']||image.attrs['data-inline-asset']===key,`${file}: mismatched image source key`);
      bytes=await readFile(new URL(key,root));
    }
    seenImageKeys.add(key);
    const expectedHash=original.logoSHA256[key.slice('assets/'.length)];
    if(expectedHash)assert.equal(createHash('sha256').update(bytes).digest('hex'),expectedHash,`${file}: original logo artwork changed`);
  }
  for(const asset of Object.keys(original.logoSHA256))assert(seenImageKeys.has('assets/'+asset),`${file}: missing original logo artwork`);
  if(/<script\b[^>]*\bsrc=["']header\.js["']/i.test(html)) {
    controllers.add(await readFile(new URL('header.js',root),'utf8'));
  } else {
    const candidates=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)]
      .map(match=>match[1]).filter(js=>js.includes(headerMarker)&&/const\s+header\s*=\s*document\.querySelector\(['"]\.store-header['"]\)/.test(js));
    assert.equal(candidates.length,1,`${file}: expected one original inline header controller`);
    controllers.add(candidates[0]);
  }
  if(file==='option-2.html')assert(!/Back to the portraits|Step inside our world|class="[^"]*\bportraits-return\b/i.test(html),`${file}: removed hero links returned`);
}
for(const controller of controllers)assert(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie|cart\.js|addEventListener\s*\(\s*['"]submit['"]|\.onsubmit\s*=/i.test(controller),'Header must not access sessions, cart APIs or intercept native search');
console.log(JSON.stringify({status:'pass',pages:2,collectionDestinations:original.collectionURLs.length,originalVectorControls:5,account:'stable verified locale-only URL',search:'native official GET; no request submitted',heroLinks:'removed on option2',scope:'source contract, not rendered behavior/security certification'}));
