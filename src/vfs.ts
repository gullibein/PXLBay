import type { RepoItem } from './scanner';

export interface VFSNode {
  id: string;
  name: string;
  isDirectory: boolean;
  parentId: string | null;
  isApp?: boolean;
  isExecutable?: boolean;
  isRecycleBin?: boolean;
  isUserCreated?: boolean;
  createdAt?: number;
  url?: string;
  iconUrl?: string;
  path?: string;
  x?: number;
  y?: number;
}

export class VFS {
  private nodes: Map<string, VFSNode> = new Map();
  private creationSeq: number = 1;

  constructor() {
    this.nodes.set('root', { id: 'root', name: '/', isDirectory: true, parentId: null, isUserCreated: false, createdAt: 0 });
    this.nodes.set('bin', { id: 'bin', name: 'Recycle Bin', isDirectory: true, parentId: 'root', isRecycleBin: true, isUserCreated: false, createdAt: 0 });
  }

  /**
   * Recursively loads a directory tree (root folders, subfolders, and files) into the VFS.
   */
  public loadTree(items: RepoItem[], parentId: string = 'root') {
    for (const item of items) {
      // Use item path or parentId/name as unique node ID
      const id = item.path || (parentId === 'root' ? item.name : `${parentId}/${item.name}`);
      const isHtml = item.name.toLowerCase().endsWith('.html') || (item.url && item.url.toLowerCase().endsWith('.html'));
      
      const node: VFSNode = {
        id,
        name: item.name,
        isDirectory: item.isDirectory,
        parentId: parentId,
        isApp: item.isApp,
        isExecutable: !item.isDirectory && (isHtml || !!item.url),
        isUserCreated: false,
        createdAt: 0,
        url: item.url,
        iconUrl: item.iconUrl,
        path: item.path
      };

      this.nodes.set(id, node);

      if (item.isDirectory && item.children && item.children.length > 0) {
        this.loadTree(item.children, id);
      }
    }
  }

  public createFile(parentId: string, name: string, url: string, isExecutable: boolean = true): VFSNode {
    const uniqueName = this.getUniqueName(parentId, name, false);
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const node: VFSNode = {
      id,
      name: uniqueName,
      isDirectory: false,
      parentId,
      url,
      isExecutable,
      isUserCreated: true,
      createdAt: ++this.creationSeq
    };
    this.nodes.set(id, node);
    return node;
  }

  public getChildren(parentId: string): VFSNode[] {
    const result: VFSNode[] = [];
    for (const node of this.nodes.values()) {
      if (node.parentId === parentId) {
        result.push(node);
      }
    }
    // Sort to ensure Recycle Bin is first on desktop,
    // then initial system/repo items (folders first, then alphabetical),
    // then user-created files/folders at the end of the row in creation order.
    return result.sort((a, b) => {
      if (a.isRecycleBin) return -1;
      if (b.isRecycleBin) return 1;

      const aIsUser = !!a.isUserCreated;
      const bIsUser = !!b.isUserCreated;

      if (!aIsUser && bIsUser) return -1;
      if (aIsUser && !bIsUser) return 1;

      if (!aIsUser && !bIsUser) {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      }

      const aTime = a.createdAt || 0;
      const bTime = b.createdAt || 0;
      if (aTime !== bTime) {
        return aTime - bTime;
      }
      return a.name.localeCompare(b.name);
    });
  }

  private getUniqueName(parentId: string | null, name: string, isDirectory: boolean, excludeId?: string): string {
    if (!parentId) return name;
    const children = this.getChildren(parentId);
    let finalName = name;
    let counter = 1;
    
    while (true) {
      const conflict = children.find(c => 
        c.id !== excludeId && 
        c.name.toLowerCase() === finalName.toLowerCase() && 
        c.isDirectory === isDirectory
      );
      
      if (!conflict) return finalName;
      finalName = `${name} ${counter}`;
      counter++;
    }
  }

  public createFolder(parentId: string, name: string): VFSNode {
    const uniqueName = this.getUniqueName(parentId, name, true);
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    const node: VFSNode = { 
      id, 
      name: uniqueName, 
      isDirectory: true, 
      parentId, 
      isUserCreated: true, 
      createdAt: ++this.creationSeq 
    };
    this.nodes.set(id, node);
    return node;
  }

  public deleteNode(id: string) {
    const node = this.nodes.get(id);
    if (!node) return;

    // Prevent deleting special system folders
    if (id === 'root' || id === 'bin') return;

    if (node.parentId === 'bin') {
      // Permanent delete
      this.nodes.delete(id);
      const children = this.getChildren(id);
      for (const child of children) {
        this.deleteNode(child.id);
      }
    } else {
      // Move to recycle bin
      node.parentId = 'bin';
    }
  }

  public emptyBin() {
    const children = this.getChildren('bin');
    for (const child of children) {
      this.deleteNode(child.id);
    }
  }

  public renameNode(id: string, newName: string) {
    const node = this.nodes.get(id);
    if (!node) return;
    // Prevent renaming special folders
    if (id === 'root' || id === 'bin') return;
    
    const uniqueName = this.getUniqueName(node.parentId, newName, node.isDirectory, id);
    node.name = uniqueName;
  }

  public getNode(id: string): VFSNode | undefined {
    return this.nodes.get(id);
  }

  public updateNodePosition(id: string, x: number | undefined, y: number | undefined) {
    const node = this.nodes.get(id);
    if (node) {
      node.x = x;
      node.y = y;
    }
  }

  public copyNode(id: string, targetParentId: string): VFSNode | null {
    const source = this.nodes.get(id);
    if (!source || id === 'root') return null;
    
    const newName = this.getUniqueName(targetParentId, source.name, source.isDirectory);
    const newId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    
    const newNode: VFSNode = {
      ...source,
      id: newId,
      parentId: targetParentId,
      name: newName,
      isUserCreated: true,
      createdAt: ++this.creationSeq,
      x: source.x !== undefined ? source.x + 10 : undefined,
      y: source.y !== undefined ? source.y + 10 : undefined
    };
    
    this.nodes.set(newId, newNode);
    
    if (source.isDirectory) {
      const children = this.getChildren(id);
      for (const child of children) {
        this.copyNode(child.id, newId);
      }
    }
    
    return newNode;
  }

  public moveNode(id: string, newParentId: string) {
    const node = this.nodes.get(id);
    if (!node) return;
    if (id === 'root' || id === 'bin') return;
    
    const newName = this.getUniqueName(newParentId, node.name, node.isDirectory, id);
    node.parentId = newParentId;
    node.name = newName;
  }
}
