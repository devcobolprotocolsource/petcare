const fs = require('fs');
const path = require('path');

function processFile(file) {
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;
  // add type="button" to <button> tags missing type
  s = s.replace(/<button((?![^>]*\btype=)[^>]*)>/gi, (m, attrs) => {
    return `<button type="button"${attrs}>`;
  });

  // add scope="col" to <th> missing scope
  s = s.replace(/<th((?![^>]*\bscope=)[^>]*)>/gi, (m, attrs) => {
    return `<th scope="col"${attrs}>`;
  });

  // convert self-closing input like <input .../> to <input ...>
  s = s.replace(/<input([^>]*)\/>/gi, (m, attrs) => {
    return `<input${attrs}>`;
  });

  // replace ' & ' with ' &amp; ' (basic cases)
  s = s.replace(/\s&\s/g, ' &amp; ');

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
