const fs = require('fs');
const path = require('path');

const styleMap = new Map();
let counter = 0;

function ensureStyleFile() {
  const cssPath = path.join(process.cwd(), 'styles', 'style.css');
  if (!fs.existsSync(path.dirname(cssPath))) {
    fs.mkdirSync(path.dirname(cssPath), { recursive: true });
  }
  if (!fs.existsSync(cssPath)) fs.writeFileSync(cssPath, '/* Central stylesheet */\n', 'utf8');
  return cssPath;
}

function processFile(file) {
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;
  s = s.replace(/style="([^"]+)"/gi, (m, style) => {
    const key = style.trim();
    if (!styleMap.has(key)) {
      counter += 1;
      const cls = `is-${counter}`;
      styleMap.set(key, cls);
    }
    const cls = styleMap.get(key);
    // inject or append to existing class attribute
    return `class=\"${cls}\"`;
  });

  // If replacement produced class="is-..." but element already had class attr, we lost it. Improve: handle class merging
  // A more robust approach: replace `class="X" style="..."` patterns first
  // For now, re-run to fix merged cases
  s = s.replace(/class=\"([^\"]+)\"\s*class=\"(is-\d+)\"/gi, (m, existing, added) => {
    return `class=\"${existing} ${added}\"`;
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

const cssPath = ensureStyleFile();
walk(process.cwd());

if (styleMap.size > 0) {
  const cssLines = ['\n/* Auto-migrated inline styles */'];
  for (const [style, cls] of styleMap.entries()) {
    cssLines.push(`.${cls} { ${style} }`);
  }
  fs.appendFileSync(cssPath, cssLines.join('\n') + '\n', 'utf8');
  console.log('Appended', styleMap.size, 'styles to', cssPath);
} else {
  console.log('No inline styles found');
}
console.log('Done');
