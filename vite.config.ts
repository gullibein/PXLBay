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

function getScanConfig(): { targetDir: string; urlPrefix: string } {
  // If system_folder exists inside the project, use it as the root of the OS
  const systemFolder = path.resolve(process.cwd(), 'system_folder');
  if (fs.existsSync(systemFolder)) {
    return { targetDir: systemFolder, urlPrefix: 'system_folder' };
  }
  return { targetDir: process.cwd(), urlPrefix: '' };
}

function scanDirectoryRecursive(baseDir: string, relativeDir: string = '', urlPrefix: string = ''): RepoItem[] {
  const currentDir = path.resolve(baseDir, relativeDir);
  if (!fs.existsSync(currentDir)) return [];

  try {
    const dirents = fs.readdirSync(currentDir, { withFileTypes: true });
    const items: RepoItem[] = [];

    for (const dirent of dirents) {
      if (IGNORED_NAMES.has(dirent.name) || dirent.name.startsWith('.')) continue;

      const itemRelPath = relativeDir ? `${relativeDir}/${dirent.name}` : dirent.name;
      const fullPath = path.resolve(currentDir, dirent.name);
      const itemUrl = urlPrefix ? `${urlPrefix}/${itemRelPath}` : itemRelPath;

      if (dirent.isDirectory()) {
        const children = scanDirectoryRecursive(baseDir, itemRelPath, urlPrefix);
        
        // Check if directory is an app (contains index.html or any .html)
        let isApp = false;
        let appUrl: string | undefined;

        const htmlFiles = children.filter(c => !c.isDirectory && c.name.toLowerCase().endsWith('.html'));
        const mainHtml = htmlFiles.find(c => c.name.toLowerCase() === 'index.html') || htmlFiles[0];

        if (mainHtml) {
          isApp = true;
          appUrl = mainHtml.url || `${itemUrl}/${mainHtml.name}`;
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
        items.push({
          name: dirent.name,
          path: itemRelPath,
          isDirectory: false,
          url: itemUrl
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

function generateTreeJson(): RepoItem[] {
  const { targetDir, urlPrefix } = getScanConfig();
  return scanDirectoryRecursive(targetDir, '', urlPrefix);
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
        fs.writeFileSync(outputPath, JSON.stringify(tree, null, 2), 'utf-8');
        console.log(`[repo-tree-scanner] Generated ${outputPath} (${tree.length} root items from system_folder)`);
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

        // Serve files from workspace if requested
        server.middlewares.use((req, res, next) => {
          if (!req.url || req.url === '/' || req.url.startsWith('/src') || req.url.startsWith('/@') || req.url.startsWith('/node_modules') || req.url.startsWith('/public') || req.url.startsWith('/fon')) {
            return next();
          }

          const decodedUrl = decodeURIComponent(req.url.split('?')[0]);
          const cleanPath = decodedUrl.replace(/^\/+/, '');
          const candidatePath = path.resolve(process.cwd(), cleanPath);

          if (candidatePath.startsWith(process.cwd()) && fs.existsSync(candidatePath)) {
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
