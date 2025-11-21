const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { marked } = require('marked');

async function mdToPdf(inputPath, outputPath) {
  const markdown = fs.readFileSync(inputPath, 'utf-8');
  const htmlContent = marked.parse(markdown, { breaks: true });

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${path.basename(inputPath)}</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Noto Sans SC','Microsoft YaHei',Arial,sans-serif;margin:20px;color:#111;}
    h1,h2,h3,h4{color:#0f172a;}
    pre{background:#f8fafc;padding:12px;border-radius:8px;overflow:auto;}
    code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;}
    table{border-collapse:collapse;width:100%;margin:12px 0;}
    th,td{border:1px solid #e5e7eb;padding:8px;}
    blockquote{border-left:4px solid #3b82f6;padding-left:12px;color:#374151;}
    hr{border:none;border-top:1px solid #e5e7eb;margin:16px 0;}
    img{max-width:100%;}
    .mermaid{page-break-inside:avoid;margin:12px 0;}
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js' });
  await page.evaluate(async () => {
    // 将 <pre><code class="language-mermaid">...</code></pre> 转换为 <div class="mermaid">...</div>
    document.querySelectorAll('pre > code.language-mermaid').forEach(codeEl => {
      const parent = codeEl.parentElement;
      const text = codeEl.textContent || '';
      const div = document.createElement('div');
      div.className = 'mermaid';
      div.textContent = text;
      parent.replaceWith(div);
    });
    if (window.mermaid) {
      window.mermaid.initialize({ startOnLoad: false, theme: 'default' });
      await window.mermaid.run({ querySelector: '.mermaid' });
    }
  });
  await page.waitForSelector('.mermaid svg', { timeout: 10000 }).catch(() => {});
  await page.pdf({ path: outputPath, format: 'A4', printBackground: true, margin: { top: '15mm', right: '12mm', bottom: '15mm', left: '12mm' } });
  await browser.close();
}

async function main() {
  const input = 'docs/Supermemory功能需求文档.md';
  const output = 'docs/pdf/Supermemory功能需求文档.pdf';
  fs.mkdirSync('docs/pdf', { recursive: true });
  console.log(`Converting ${input} -> ${output}`);
  await mdToPdf(path.resolve(input), path.resolve(output));
  console.log('PDF generated.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});