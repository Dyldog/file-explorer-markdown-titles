import { updateTitle } from 'folder-count';
import FileExplorerNoteCount from 'main';
import { getParentPath } from 'misc';
import { App, debounce, TAbstractFile, Vault } from 'obsidian';

export class VaultHandler {
    waitingList: string[] = [];
    get app(): App {
        return this.plugin.app;
    }
    get vault(): Vault {
        return this.plugin.app.vault;
    }
    plugin: FileExplorerNoteCount;
    constructor(plugin: FileExplorerNoteCount) {
        this.plugin = plugin;
    }

    update = debounce(
        () => updateTitle(this.waitingList, this.plugin, this.vault),
        500,
        true,
    );

    handler = (...args: (string | TAbstractFile)[]) => {
        for (const arg of args) {
            const path = arg instanceof TAbstractFile ? arg.path : arg;
            this.waitingList.push(getParentPath(path) ?? '/');
        }
        this.update();
    };

    registerVaultEvent = () => {
        this.plugin.registerEvent(this.vault.on('create', this.handler));
        this.plugin.registerEvent(this.vault.on('rename', this.handler));
        this.plugin.registerEvent(this.vault.on('delete', this.handler));
    };
}
