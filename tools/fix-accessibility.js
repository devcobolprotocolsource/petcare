const fs = require('fs');
const path = require('path');

function processFile(file) {
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;
  // add lang="id" to <html> if missing
  s = s.replace(/<html(?![^>]*\blang=)/i, '<html lang="id"');

  // add aria-label to nav/header/main/aside if missing
  s = s.replace(/<(nav|header|main|aside)([^>]*)>/gi, (m, tag, attrs) => {
    if (/aria-label=/.test(attrs) || /aria-labelledby=/.test(attrs)) return m;
    const label = `${tag}-automatic`;
    return `<${tag}${attrs} aria-label="${label}">`;
  });

  if (s !== orig) {
    fs.writeFileSync(file, s, 'utf8');
    console.log('Updated', file);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (fp.includes('node_modules') || fp.includes('.git')) continue;
      walk(fp);
    } else if (e.isFile() && fp.endsWith('.html')) {
      processFile(fp);
    }
  }
}

walk(process.cwd());
console.log('Done');
