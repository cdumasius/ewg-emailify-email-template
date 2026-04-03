# CLAUDE.md

## Development

### Setup
Run `npm install` to install MJML.

### Scripts
- `npm run validate` — validate all `.mjml` files
- `npm run serve` — start preview server with file watching

### Preview in Claude Code
The preview server is registered in `.claude/launch.json`. Use `preview_start` with name `mjml-preview` to launch it. The server compiles MJML on startup, validates, and recompiles when `.mjml` files change.

## Comparison Screenshots

When both `index.mjml` and `emailify/index-emailify.mjml` exist in the repo, regenerate comparison images in these situations:
- When explicitly requested
- Before merging to `main` or any target branch

The comparison is split into two images:
- `emailify/before-and-after-desktop.jpg` — Desktop (700px viewport)
- `emailify/before-and-after-mobile.jpg` — Mobile (400px viewport)

Each image shows the original on the left and simplified on the right.

### How to regenerate

1. Compile both MJML files to HTML: `npx mjml emailify/index-emailify.mjml -o /tmp/original.html && npx mjml index.mjml -o /tmp/simple.html`
2. Serve them locally: `node -e "require('http').createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end(require('fs').readFileSync('/tmp'+(req.url==='/'?'/original':req.url)+'.html'))}).listen(8765)"`
3. Run the capture script: `node /tmp/capture-comparisons.js .` (outputs comparison PNGs to the specified directory)
4. Convert to JPEG: `sips -s format jpeg compare-desktop.png --out emailify/before-and-after-desktop.jpg -s formatOptions 85` (repeat for mobile)
5. The script uses Puppeteer to screenshot both pages at each viewport size and composites them side-by-side with labels.
