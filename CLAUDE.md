# CLAUDE.md

## Development

### Setup
Run `npm install` to install MJML.

### Scripts
- `npm run build` — compile all `.mjml` files to `.html`
- `npm run validate` — validate all `.mjml` files
- `npm run serve` — start preview server at `http://localhost:3000` with file watching

### Preview in Claude Code
The preview server is registered in `.claude/launch.json`. Use `preview_start` with name `mjml-preview` to launch it. The server compiles MJML on startup, validates, and recompiles when `.mjml` files change.

### HTML output
Always run `npm run build` before committing to keep `.html` files in sync with `.mjml` sources.

## Comparison Screenshots

When both `index.mjml` and `index-simple.mjml` exist in the repo, regenerate comparison images in these situations:
- When explicitly requested
- Before merging to `main` or any target branch

The comparison is split into two images:
- `before-and-after-desktop.jpg` — Desktop (700px viewport)
- `before-and-after-mobile.jpg` — Mobile (400px viewport)

Each image shows the original on the left and simplified on the right.

### How to regenerate

1. Compile both MJML files to HTML: `npx mjml index.mjml -o /tmp/original.html && npx mjml index-simple.mjml -o /tmp/simple.html`
2. Serve them locally: `node -e "require('http').createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end(require('fs').readFileSync('/tmp'+(req.url==='/'?'/original':req.url)+'.html'))}).listen(8765)"`
3. Run the capture script: `node /tmp/capture-comparisons.js .` (outputs comparison PNGs to the specified directory)
4. Convert to JPEG: `sips -s format jpeg compare-desktop.png --out before-and-after-desktop.jpg -s formatOptions 85` (repeat for mobile)
5. The script uses Puppeteer to screenshot both pages at each viewport size and composites them side-by-side with labels.
