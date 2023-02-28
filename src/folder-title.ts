import './styles/folder-title.css';

import FileExplorerNoteCount from 'main';
import {
    isFolder,
    iterateItems,
    withSubfolderClass,
} from 'misc';
import { AFItem, FolderItem, FileItem, TFolder, TFile, Vault } from 'obsidian';

export const setupTitle = (plugin: FileExplorerNoteCount, vault: Vault, revert = false) => {
    if (!plugin.fileExplorer) throw new Error('fileExplorer not found');

    iterateItems(plugin.fileExplorer.fileItems, (item: AFItem) => {
        if (!isFolder(item)) {
            setTitle(item, vault);
        }
    });
};

export const setTitle = (item: FileItem, vault: Vault) => {
    if (item.file.extension != "md") { return }

    let idMatch = item.file.basename.match(/([^\/\\]+)/g)!
    if (idMatch) {
        let indentCount = (idMatch.length - 1)
        let indentStr = (indentCount * 20).toString() + "px"
        item.titleEl.style.marginLeft = indentStr
    }

    vault.read(item.file).then(function (val) {
        const match = /# (.+)\s*/.exec(val);
        if (match != null) {
          const name = match[1];
          item.titleInnerEl.innerText = name;
          const originalTitle = document.createElement('em');
          originalTitle.className = 'folder-filename-title';
          originalTitle.textContent = item.file.basename + '.md';
          item.titleInnerEl.append(originalTitle);
        } 
    }).catch(error => {
        console.log(`Error retrieving content of ${item.file.path}: ${error}`)
    });
}

export const updateTitle = (
    targetList: string[], 
    plugin: FileExplorerNoteCount, 
    vault: Vault
) => {
    const { fileExplorer } = plugin;
    if (!fileExplorer) {
        console.error('fileExplorer missing');
        return;
    }
    for (const path of targetList) {
        // check if path available
        if (!fileExplorer.fileItems[path]) continue;
        setTitle(fileExplorer.fileItems[path] as FileItem, vault);
    }
};

const removeTitle = (item: FileItem) => {
    if (item.titleEl.dataset['name']) delete item.titleEl.dataset['name'];
    item.titleEl.removeClass(withSubfolderClass);
};