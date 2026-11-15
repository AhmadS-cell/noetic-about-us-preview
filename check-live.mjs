import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const base = process.argv[2];
if (!base || !base.startsWith('https://')) throw new Error('Provide the deployed HTTPS base URL.');
// Git's text checkout may use CRLF locally while Pages serves LF.
const hash = data => createHash('sha256').update(data.replace(/\r\n/g, '\n')).digest('hex');
const results = await Promise.all(['index.html', 'option-1.html', 'option-2.html', '404.html', 'noindex-verification-missing-page'].map(async path => {
  const missing = path === 'noindex-verification-missing-page';
  const response = await fetch(new URL(path, base.endsWith('/') ? base : base + '/'), {signal: AbortSignal.timeout(30000)});
  const html = await response.text();
  const source = await readFile(new URL('./docs/' + (missing ? '404.html' : path), import.meta.url), 'utf8');
  const noindex = /<meta\b[^>]*name="robots"[^>]*content="[^"]*\bnoindex\b/i.test(html);
  const matchesSource = hash(html) === hash(source);
  const expectedStatus = missing ? 404 : 200;
  return {path, status: response.status, noindex, matchesSource, pass: response.status === expectedStatus && noindex && matchesSource};
}));
console.log(JSON.stringify({base, results, pass: results.every(result => result.pass)}, null, 2));
if (results.some(result => !result.pass)) process.exitCode = 1;
