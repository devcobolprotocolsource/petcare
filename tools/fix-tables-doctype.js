const fs = require('fs');
const path = require('path');

function processFile(file) {
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;
  // Fix doctype
  s = s.replace(/<!doctype html>/i, '<!DOCTYPE html>');
  // Fix broken <table><th scope="col"ead><tr> -> <table><thead><tr>
  s = s.replace(/<table>\s*<th\s+scope=\"col\"ead>\s*<tr>/gi, '<table><thead><tr>');
  // Another variant: <table><th scope="col"ead><tr>
  s = s.replace(/<table><th\s+scope=\"col\"ead><tr>/gi, '<table><thead><tr>');
  // Fix cases where <th ...>ead><tr> (without initial <table>) - replace 'th ...ead><tr>' with 'thead><tr>'
  s = s.replace(/<th([^>]*)>ead>\s*<tr>/gi, '<thead><tr>');

  if (s !== orig) {
    fs.writeFileSync(file, s, 'utf8');
    console.log('Fixed', file);
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
