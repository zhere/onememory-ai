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
    body { font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', Arial, sans-serif; margin: 20px; color: #111; }
    h1, h2, h3, h4 { color: #0f172a; }
    pre { background: #f8fafc; padding: 12px; border-radius: 8px; overflow: auto; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; }
    blockquote { border-left: 4px solid #3b82f6; padding-left: 12px; color: #374151; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
    img { max-width: 100%; }
    .page { page-break-after: always; }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({ path: outputPath, format: 'A4', printBackground: true, margin: { top: '15mm', right: '12mm', bottom: '15mm', left: '12mm' } });
  await browser.close();
}

async function main() {
  const files = [
    { in: 'docs/Supermemory技术实现方案.md', out: 'docs/pdf/Supermemory技术实现方案.pdf' },
    { in: 'docs/Supermemory技术架构设计.md', out: 'docs/pdf/Supermemory技术架构设计.pdf' },
    { in: 'docs/Supermemory核心技术实现指南.md', out: 'docs/pdf/Supermemory核心技术实现指南.pdf' },
  ];

  // ensure output directory
  fs.mkdirSync('docs/pdf', { recursive: true });

  for (const f of files) {
    console.log(`Converting ${f.in} -> ${f.out}`);
    await mdToPdf(path.resolve(f.in), path.resolve(f.out));
  }

  console.log('All PDFs generated.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});