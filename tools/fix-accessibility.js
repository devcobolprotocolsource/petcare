const fs = require('fs');
const path = require('path');

function processFile(file){
  let s = fs.readFileSync(file,'utf8');
  let orig = s;

  // 1) Icon-only buttons: add aria-label from <i data-lucide="name">
  s = s.replace(/<button([^>]*)>\s*(<i[^>]*data-lucide=\"([^\"]+)\"[^>]*><\/i>)\s*<\/button>/gi, (m, attrs, iconHtml, iconName)=>{
    if(/aria-label=/.test(attrs)) return m;
    const label = iconName.replace(/[-_]/g,' ');
    return `<button${attrs} aria-label="${label}">${iconHtml}</button>`;
  });

  // 2) Add type="text" to inputs missing type
  s = s.replace(/<input((?![^>]*\btype=)[^>]*)>/gi, (m, attrs)=>{
    return `<input type="text"${attrs}>`;
  });

  // 3) Ensure forms have a submit button
  s = s.replace(/<form([^>]*)>([\s\S]*?)<\/form>/gi, (m, attrs, inner)=>{
    if(/type=(['\"])submit\1|<button[^>]*type=(['\"])submit\2|<input[^>]*type=(['\"])submit\3/i.test(inner)){
      return m;
    }
    return `<form${attrs}>${inner}<button type="submit" style="display:none" aria-hidden="true"></button></form>`;
  });

  // 4) Unique landmarks: append index if duplicates
  const tags = ['main','nav','header','footer','aside'];
  for(const tag of tags){
    let count = 0;
    s = s.replace(new RegExp(`<${tag}([^>]*)>`, 'gi'), (m, attrs)=>{
      if(/aria-label=/.test(attrs) || /aria-labelledby=/.test(attrs)) return `<${tag}${attrs}>`;
      count++;
      const label = `${tag.charAt(0).toUpperCase()+tag.slice(1)} ${count}`;
      return `<${tag} aria-label="${label}"${attrs}>`;
    });
  }

  // 5) Replace <span> that contains <div> -> convert outer span to div
  s = s.replace(/<span([^>]*)>\s*(<div[\s\S]*?)<\/span>/gi, (m, attrs, rest)=>{
    return `<div${attrs}>${rest.replace(/<\/div>\s*$/,'</div>')}`;
  });

  if(s !== orig){
    fs.writeFileSync(file,s,'utf8');
    console.log('Fixed', file);
  }
}

function walk(dir){
  const entries = fs.readdirSync(dir,{withFileTypes:true});
  for(const e of entries){
    const fp = path.join(dir,e.name);
    if(e.isDirectory()){
      if(fp.includes('node_modules')||fp.includes('.git')) continue;
      walk(fp);
    } else if(e.isFile() && fp.endsWith('.html')){
      processFile(fp);
    }
  }
}

walk(process.cwd());
console.log('Done');
