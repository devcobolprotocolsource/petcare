const fs = require('fs');
const path = require('path');

const styleMap = new Map();
let counter = 1;

function normalizeStyle(s){
  return s.trim().replace(/;\s*/g,';').replace(/;$/,'');
}

function makeClassName(i){
  return `inline-style-${i}`;
}

function processFile(file, stylesOut){
  let s = fs.readFileSync(file,'utf8');
  let changed = false;

  // ensure <html> has lang="id"
  s = s.replace(/<html([^>]*)>/i, (m, attrs)=>{
    if(/\blang=/.test(attrs)) return `<html${attrs}>`;
    changed = true;
    return `<html lang="id"${attrs}>`;
  });

  // ensure landmarks have aria-label if missing
  const landmarks = ['main','nav','header','footer','aside'];
  for(const tag of landmarks){
    const re = new RegExp(`<${tag}([^>]*)>`, 'gi');
    s = s.replace(re, (m, attrs)=>{
      if(/\baria-label=/.test(attrs) || /\brole=/.test(attrs)) return `<${tag}${attrs}>`;
      changed = true;
      const label = {
        main: 'Konten Utama', nav: 'Navigasi', header: 'Header', footer: 'Footer', aside: 'Samping'
      }[tag] || tag;
      return `<${tag} aria-label="${label}"${attrs}>`;
    });
  }

  // collect style attributes
  s = s.replace(/(<[a-zA-Z0-9\-]+)([^>]*?)\sstyle=(['\"])(.*?)\3([^>]*>)/gis, (m, tagStart, beforeAttrs, q, style, after)=>{
    const norm = normalizeStyle(style);
    let cls;
    if(styleMap.has(norm)){
      cls = styleMap.get(norm);
    } else {
      cls = makeClassName(counter++);
      styleMap.set(norm, cls);
      stylesOut.push({className: cls, style: norm});
    }
    // add class attribute or append
    if(/\bclass=/.test(beforeAttrs+after)){
      // insert class into existing class attribute
      const combined = (beforeAttrs+after).replace(/class=(['"])(.*?)\1/, (m2, q2, cval)=>{
        return `class=${q2}${cval} ${cls}${q2}`;
      });
      changed = true;
      return `${tagStart}${combined}`;
    } else {
      changed = true;
      return `${tagStart}${beforeAttrs} class="${cls}"${after}`;
    }
  });

  if(changed){
    fs.writeFileSync(file, s, 'utf8');
    console.log('Modified', file);
  }
}

function walk(dir){
  const stylesOut = [];
  const files = [];
  function rec(d){
    const entries = fs.readdirSync(d, {withFileTypes:true});
    for(const e of entries){
      const fp = path.join(d,e.name);
      if(e.isDirectory()){
        if(fp.includes('node_modules')||fp.includes('.git')) continue;
        rec(fp);
      } else if(e.isFile() && fp.endsWith('.html')){
        files.push(fp);
      }
    }
  }
  rec(dir);
  for(const f of files) processFile(f, stylesOut);
  return stylesOut;
}

const out = walk(process.cwd());
if(out.length){
  const cssPath = path.join(process.cwd(),'styles','style.css');
  let css = '';
  if(fs.existsSync(cssPath)) css = fs.readFileSync(cssPath,'utf8');
  const marker = '\n/* AUTO-EXTRACTED INLINE STYLES */\n';
  if(css.includes(marker)){
    css = css.split(marker)[0];
  }
  css += marker;
  for(const item of out){
    css += `.${item.className} { ${item.style} }\n`;
  }
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Wrote styles to', cssPath);
} else {
  console.log('No inline styles found');
}
console.log('Done');
