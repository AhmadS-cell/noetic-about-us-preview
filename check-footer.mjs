import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

// Public store capture is an independent fixture, not generated from either option.
// Optional source-directory argument permits checking the canonical local build before copy.
const directory = new URL((process.argv[2] || './source/').replace(/\/?$/, '/'), import.meta.url);
const fixture = await readFile(new URL('./reference/original-footer.html', import.meta.url), 'utf8');
const namedEntities = {amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ', copy:'©'};
const decode = text => text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp|copy);/gi, (whole, value) => {
  if (value[0] === '#') return String.fromCodePoint(value[1].toLowerCase() === 'x' ? parseInt(value.slice(2), 16) : parseInt(value.slice(1), 10));
  return namedEntities[value.toLowerCase()] ?? whole;
});
const normalizeText = text => decode(text).replace(/\s+/g, ' ').trim();
function attributes(text) {
  const result = {};
  for (const match of text.matchAll(/([^\s=<>"'`/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s<>`]+)))?/g)) {
    const name = match[1].toLowerCase();
    assert(!(name in result), `Duplicate attribute: ${name}`);
    result[name] = decode(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return result;
}
function inspect(html) {
  const footers = [...html.matchAll(/<footer(?=\s|>)[^>]*>[\s\S]*?<\/footer\s*>/gi)];
  assert.equal(footers.length, 1, 'Exactly one native footer is required');
  const footer = footers[0][0];
  assert(!/<script\b|<iframe\b|<object\b|<embed\b/i.test(footer), 'Active/embedded code in footer');
  const data = {text:[], links:[], forms:[], fields:[], summaries:[], details:[], ids:[]};
  const stack = [];
  const voidTags = new Set(['input','img','br','hr','meta','link']);
  for (const token of footer.matchAll(/<!--[\s\S]*?-->|<\/?([a-z][\w:-]*)\b([^<>]*?)\/?>|([^<]+)/gi)) {
    if (token[0].startsWith('<!--')) continue;
    if (token[3] !== undefined) {const text=normalizeText(token[3]); if(text)data.text.push(text); continue;}
    const tag = token[1].toLowerCase();
    if (token[0].startsWith('</')) {const position=stack.lastIndexOf(tag); if(position>=0)stack.length=position; continue;}
    const attrs = attributes(token[2]);
    for (const [name,value] of Object.entries(attrs)) {
      assert(!/^on/i.test(name), `Inline event handler: ${name}`);
      if (['href','src','action','xlink:href'].includes(name)) assert(!/^\s*(javascript|vbscript):/i.test(value), `Active URL: ${name}`);
    }
    if (attrs.id) data.ids.push(attrs.id);
    if (tag==='a') data.links.push(attrs);
    if (tag==='form') data.forms.push(attrs);
    if (['input','button','label'].includes(tag)) data.fields.push({tag,...attrs});
    if (tag==='details') data.details.push(attrs);
    if (tag==='summary') data.summaries.push({parent:stack.at(-1),...attrs});
    if (!voidTags.has(tag) && !token[0].endsWith('/>')) stack.push(tag);
  }
  return data;
}
const original = inspect(fixture);
assert.equal(original.links.length, 8, 'Unexpected public fixture link count');
const officialURL = href => new URL(href, 'https://noetic.sa').href;
const expectedLinks = original.links.map(link => officialURL(link.href));
const scriptFiles = new Set();
for (const file of ['option-1.html','option-2.html']) {
  const html = await readFile(new URL(file, directory), 'utf8');
  const current = inspect(html);
  assert.deepEqual(current.text, original.text, `${file}: footer copy/metadata changed`);
  assert.deepEqual(current.links.map(link => link.href), expectedLinks, `${file}: original footer links changed`);
  assert.deepEqual(current.fields, original.fields, `${file}: newsletter controls/fields changed`);
  assert.equal(current.forms.length, 1, `${file}: newsletter form count`);
  const form = current.forms[0];
  assert.equal(form.method?.toLowerCase(), 'post', `${file}: native POST required`);
  assert.equal(form.action, 'https://noetic.sa/en/contact#footer-signup_form', `${file}: official newsletter destination`);
  assert.equal(form.id, 'footer-signup_form');
  assert.equal(form['accept-charset']?.toUpperCase(), 'UTF-8');
  assert(!form.target && !('onsubmit' in form), `${file}: unexpected form navigation/handler`);
  const email = current.fields.find(field=>field.tag==='input' && field.name==='contact[email]');
  assert(email?.type==='email' && 'required' in email && email.autocomplete==='email', `${file}: native email validation/autocomplete`);
  assert(current.fields.some(field=>field.tag==='label' && field.for===email.id), `${file}: email label association`);
  assert.equal(current.details.length, 2, `${file}: native disclosure count`);
  assert.equal(current.summaries.length, 2, `${file}: disclosure summary count`);
  assert(current.summaries.every(summary=>summary.parent==='details' && summary.tabindex!=='-1'), `${file}: keyboard-accessible native summaries`);
  assert(current.links.filter(link=>link.target==='_blank').every(link=>link.rel?.split(/\s+/).includes('noopener')), `${file}: new-tab links must isolate their opener`);
  for (const id of current.ids) assert.equal([...html.matchAll(/\bid="([^"]+)"/g)].filter(match=>match[1]===id).length, 1, `${file}: duplicate footer ID ${id}`);
  for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) scriptFiles.add(match[1]);
}
for (const file of scriptFiles) {
  assert(!/^(https?:)?\/\//i.test(file), `Remote script introduced: ${file}`);
  const js = await readFile(new URL(file, directory), 'utf8');
  assert(!/addEventListener\s*\(\s*['"](?:submit|formdata)['"]|\.onsubmit\s*=|\.requestSubmit\s*\(|\.submit\s*\(/i.test(js), `${file}: newsletter submission override introduced`);
  if (file==='footer.js') assert(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|preventDefault/i.test(js), 'Footer must not intercept/store/transmit newsletter data');
}
console.log(JSON.stringify({status:'pass',pages:2,originalLinks:8,copyAndMetadata:'match public fixture',newsletter:'native official POST; no submission performed',disclosures:'native keyboard-accessible',scope:'source parity checks; not a security certification'}));
