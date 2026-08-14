import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

interface RepoItem {
  name: string;
  path: string;
  isDirectory: boolean;
  isApp?: boolean;
  url?: string;
  children?: RepoItem[];
}

const IGNORED_NAMES = new Set([
  '.git',
  '.github',
  'node_modules',
  'dist',
  '.gemini',
  '.vscode',
  '.idea',
  '.claude',
  '.system_generated',
  '.agents',
  'target',
  'bin',
  'obj'
]);

function scanDirectoryRecursive(baseDir: string, relativeDir: string = ''): RepoItem[] {
  const currentDir = path.resolve(baseDir, relativeDir);
  if (!fs.existsSync(currentDir)) return [];

  try {
    const dirents = fs.readdirSync(currentDir, { withFileTypes: true });
    const items: RepoItem[] = [];

    for (const dirent of dirents) {
      if (IGNORED_NAMES.has(dirent.name) || dirent.name.startsWith('.')) continue;

      const itemRelPath = relativeDir ? `${relativeDir}/${dirent.name}` : dirent.name;
      const fullPath = path.resolve(currentDir, dirent.name);

      if (dirent.isDirectory()) {
        const children = scanDirectoryRecursive(baseDir, itemRelPath);
        
        // Check if directory is an app (contains index.html, rogue8.html, or any .html)
        let isApp = false;
        let appUrl: string | undefined;

        const htmlFiles = children.filter(c => !c.isDirectory && c.name.toLowerCase().endsWith('.html'));
        const mainHtml = htmlFiles.find(c => c.name.toLowerCase() === 'index.html') || htmlFiles[0];

        if (mainHtml) {
          isApp = true;
          appUrl = mainHtml.url || mainHtml.path;
        } else if (fs.existsSync(path.join(fullPath, 'package.json'))) {
          isApp = true;
        }

        items.push({
          name: dirent.name,
          path: itemRelPath,
          isDirectory: true,
          isApp,
          url: appUrl,
          children
        });
      } else {
        const ext = path.extname(dirent.name).toLowerCase();
        // Ignore certain heavy binary formats from root scan if needed, or keep all files
        items.push({
          name: dirent.name,
          path: itemRelPath,
          isDirectory: false,
          url: itemRelPath
        });
      }
    }

    // Sort folders first, then files alphabetically
    return items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (err) {
    console.error('Error scanning directory:', currentDir, err);
    return [];
  }
}

function getScanTargetDir(): string {
  // If parent folder has other folders (e.g. PXLRogue, AsciiBotz, etc.), scan parent
  const parentDir = path.resolve(process.cwd(), '..');
  try {
    const parentEntries = fs.readdirSync(parentDir);
    if (parentEntries.some(e => e === 'PXLRogue' || e === 'AsciiBotz' || e === 'Codebotz')) {
      return parentDir;
    }
  } catch {}
  return process.cwd();
}

function generateTreeJson(): RepoItem[] {
  const targetDir = getScanTargetDir();
  return scanDirectoryRecursive(targetDir);
}

export default defineConfig({
  base: './',
  server: {
    fs: {
      allow: ['..']
    }
  },
  plugins: [
    {
      name: 'repo-tree-scanner',
      buildStart() {
        const tree = generateTreeJson();
        const publicDir = path.resolve(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        const outputPath = path.join(publicDir, 'repo-tree.json');
        if (tree.length > 0 || !fs.existsSync(outputPath)) {
          fs.writeFileSync(outputPath, JSON.stringify(tree, null, 2), 'utf-8');
          console.log(`[repo-tree-scanner] Generated ${outputPath} (${tree.length} root items)`);
        }
      },
      configureServer(server) {
        // Serve /repo-tree.json dynamically in dev mode
        server.middlewares.use('/repo-tree.json', (_req, res) => {
          const tree = generateTreeJson();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(tree));
        });

        server.middlewares.use('/api/repo-tree', (_req, res) => {
          const tree = generateTreeJson();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(tree));
        });

        // Serve files from the target directory if requested
        server.middlewares.use((req, res, next) => {
          if (!req.url || req.url === '/' || req.url.startsWith('/src') || req.url.startsWith('/@') || req.url.startsWith('/node_modules') || req.url.startsWith('/public') || req.url.startsWith('/fon')) {
            return next();
          }

          const decodedUrl = decodeURIComponent(req.url.split('?')[0]);
          const targetBase = getScanTargetDir();
          const cleanPath = decodedUrl.replace(/^\/+/, '');
          const candidatePath = path.resolve(targetBase, cleanPath);

          if (candidatePath.startsWith(targetBase) && fs.existsSync(candidatePath)) {
            const stat = fs.statSync(candidatePath);
            if (stat.isDirectory()) {
              const indexPath = path.join(candidatePath, 'index.html');
              if (fs.existsSync(indexPath)) {
                res.setHeader('Content-Type', 'text/html');
                res.end(fs.readFileSync(indexPath));
                return;
              }
            } else {
              const ext = path.extname(candidatePath).toLowerCase();
              const mimeTypes: Record<string, string> = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.json': 'application/json',
                '.txt': 'text/plain',
                '.fon': 'application/octet-stream'
              };
              res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
              res.end(fs.readFileSync(candidatePath));
              return;
            }
          }

          next();
        });
      }
    }
  ]
});
