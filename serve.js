const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PORT = process.env.PORT || 3000;
const MJML_FILES = [
  { src: "index.mjml", out: "index.html" },
  { src: "index-emailify.mjml", out: "index-emailify.html" },
];

function compile(entry) {
  const { src, out } = entry;
  try {
    const result = execSync(
      `npx mjml --validate "${src}" 2>&1`
    ).toString();
    if (result.trim()) {
      console.log(`⚠  ${src} validation:\n${result}`);
    } else {
      console.log(`✓  ${src} valid`);
    }
  } catch (e) {
    console.error(`✗  ${src} validation errors:\n${e.stdout?.toString() || e.message}`);
  }
  try {
    execSync(`npx mjml "${src}" -o "${out}"`);
    console.log(`✓  ${src} → ${out}`);
  } catch (e) {
    console.error(`✗  Failed to compile ${src}:\n${e.message}`);
  }
}

function compileAll() {
  console.log("\n--- Compiling MJML ---");
  for (const entry of MJML_FILES) {
    if (fs.existsSync(entry.src)) compile(entry);
  }
  console.log("");
}

// Index page listing available templates
function indexPage() {
  const links = MJML_FILES.map((entry) => {
    if (!fs.existsSync(entry.out)) return "";
    return `<li><a href="/${entry.out}">${entry.src}</a></li>`;
  })
    .filter(Boolean)
    .join("\n        ");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>MJML Preview</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 60px auto; color: #333; }
    h1 { font-size: 24px; margin-bottom: 20px; }
    li { margin: 8px 0; }
    a { color: #009a4f; font-size: 18px; }
  </style>
</head>
<body>
  <h1>MJML Email Templates</h1>
  <ul>
    ${links}
  </ul>
  <p style="margin-top: 30px; color: #888; font-size: 13px;">Watching for .mjml changes&hellip;</p>
</body>
</html>`;
}

// Compile on startup
compileAll();

// Watch for changes
for (const entry of MJML_FILES) {
  if (!fs.existsSync(entry.src)) continue;
  fs.watchFile(entry.src, { interval: 500 }, () => {
    console.log(`♻  ${entry.src} changed`);
    compile(entry);
  });
}

// Serve
const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  if (url === "/" || url === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(indexPage());
    return;
  }

  // Serve .html files
  const filePath = path.join(__dirname, url.slice(1));
  if (filePath.endsWith(".html") && fs.existsSync(filePath)) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(fs.readFileSync(filePath));
    return;
  }

  // Serve images
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
    };
    if (mimeTypes[ext]) {
      res.writeHead(200, { "Content-Type": mimeTypes[ext] });
      res.end(fs.readFileSync(filePath));
      return;
    }
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`🚀 Preview server running at http://localhost:${PORT}`);
  console.log(`   Watching: ${MJML_FILES.map(e => e.src).join(", ")}\n`);
});
