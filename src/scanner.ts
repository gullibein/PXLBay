export interface RepoItem {
  name: string;
  path: string;
  isDirectory: boolean;
  isApp?: boolean;
  url?: string;
  children?: RepoItem[];
}

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

/**
 * Builds a nested RepoItem tree from a flat list of GitHub git tree paths.
 */
function buildTreeFromGitHub(treeItems: GitHubTreeItem[]): RepoItem[] {
  const rootItems: RepoItem[] = [];
  const map: Map<string, RepoItem> = new Map();

  // Filter out unwanted paths
  const ignoredPrefixes = ['.git', '.github', 'node_modules', 'dist', '.gemini', '.vscode', '.idea', '.claude'];

  // Check if system_folder exists in tree
  const hasSystemFolder = treeItems.some(i => i.path.startsWith('system_folder/') || i.path === 'system_folder');

  const filtered = treeItems.filter(item => {
    if (hasSystemFolder) {
      return item.path.startsWith('system_folder/') && item.path !== 'system_folder';
    }
    const parts = item.path.split('/');
    return !parts.some(p => ignoredPrefixes.includes(p) || (p.startsWith('.') && p !== '.'));
  });

  // First pass: create all directories and files in map
  for (const item of filtered) {
    const rawPath = hasSystemFolder ? item.path.replace(/^system_folder\//, '') : item.path;
    const parts = rawPath.split('/');
    const name = parts[parts.length - 1];
    const isDirectory = item.type === 'tree';

    const repoItem: RepoItem = {
      name,
      path: rawPath,
      isDirectory,
      url: !isDirectory ? item.path : undefined,
      children: isDirectory ? [] : undefined
    };

    map.set(rawPath, repoItem);
  }

  // Second pass: attach children to parents
  for (const item of filtered) {
    const rawPath = hasSystemFolder ? item.path.replace(/^system_folder\//, '') : item.path;
    const repoItem = map.get(rawPath)!;
    const parts = rawPath.split('/');

    if (parts.length === 1) {
      // Root level item
      rootItems.push(repoItem);
    } else {
      const parentPath = parts.slice(0, -1).join('/');
      const parentItem = map.get(parentPath);
      if (parentItem && parentItem.isDirectory) {
        if (!parentItem.children) parentItem.children = [];
        parentItem.children.push(repoItem);
      } else {
        rootItems.push(repoItem);
      }
    }
  }

  // Third pass: identify apps (directories containing index.html or *.html)
  for (const repoItem of map.values()) {
    if (repoItem.isDirectory && repoItem.children) {
      const htmlFiles = repoItem.children.filter(c => !c.isDirectory && c.name.toLowerCase().endsWith('.html'));
      const mainHtml = htmlFiles.find(c => c.name.toLowerCase() === 'index.html') || htmlFiles[0];
      if (mainHtml) {
        repoItem.isApp = true;
        repoItem.url = mainHtml.url || mainHtml.path;
      }
    }
  }

  // Sort folders first, then files alphabetically
  function sortTree(items: RepoItem[]) {
    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
    for (const item of items) {
      if (item.children) sortTree(item.children);
    }
  }

  sortTree(rootItems);
  return rootItems;
}

/**
 * Attempts to fetch live repo structure via GitHub REST API if running on GitHub Pages.
 */
async function fetchFromGitHubApi(): Promise<RepoItem[] | null> {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    let repoSlug = urlParams.get('repo');

    if (!repoSlug && window.location.hostname.endsWith('.github.io')) {
      const owner = window.location.hostname.split('.')[0];
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const repo = pathParts[0];
      if (owner && repo) {
        repoSlug = `${owner}/${repo}`;
      }
    }

    if (!repoSlug) return null;

    const branches = ['main', 'master'];
    for (const branch of branches) {
      const apiUrl = `https://api.github.com/repos/${repoSlug}/git/trees/${branch}?recursive=1`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data: GitHubTreeResponse = await res.json();
        if (data && data.tree) {
          console.log(`[scanner] Loaded ${data.tree.length} items from GitHub API (${repoSlug})`);
          return buildTreeFromGitHub(data.tree);
        }
      }
    }
  } catch (err) {
    console.warn('[scanner] GitHub API fetch failed:', err);
  }
  return null;
}

/**
 * Main function to load the repository directory and subfolder tree.
 */
export async function fetchRepositoryTree(): Promise<RepoItem[]> {
  // 1. Try static / local repo-tree.json (generated during build & dev)
  try {
    const basePath = import.meta.env.BASE_URL || './';
    const jsonUrl = basePath.endsWith('/') ? `${basePath}repo-tree.json` : `${basePath}/repo-tree.json`;
    
    const res = await fetch(jsonUrl, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        console.log(`[scanner] Loaded ${data.length} root items from ${jsonUrl}`);
        return data;
      }
    }
  } catch (err) {
    console.warn('[scanner] Could not fetch repo-tree.json:', err);
  }

  // 2. Fallback to GitHub API (if hosted on GitHub Pages)
  const ghTree = await fetchFromGitHubApi();
  if (ghTree && ghTree.length > 0) {
    return ghTree;
  }

  // 3. Fallback: empty array if nothing found
  return [];
}
