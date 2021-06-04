import { FileExplorer, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, FileExplorerNoteCountSettingsTab } from './settings';
import { setupCount, updateCount } from './folder-count';
import { dirname } from 'path';
import { withSubfolderClass } from 'misc';
import './styles/patch.css';

export default class FileExplorerNoteCount extends Plugin {

	settings = DEFAULT_SETTINGS;
	loadedStyles: HTMLStyleElement[] = [];

	fileExplorer?: FileExplorer;

  registerVaultEvent() {
    // attach events on new folder
    this.registerEvent(
      this.app.vault.on('create', (af) => {
        updateCount(af, this);
      }),
    );
    // include mv and rename
    this.registerEvent(
      this.app.vault.on('rename', (af, oldPath) => {
        // when file is moved
        if (dirname(af.path) !== dirname(oldPath)) {
          updateCount(af, this);
          updateCount(oldPath, this);
        }
      }),
    );
    this.registerEvent(
      this.app.vault.on('delete', (af) => {
        updateCount(af, this);
      }),
    );
  }

	initialize = (revert = false) => {
    const leaves = this.app.workspace.getLeavesOfType('file-explorer');
    if (leaves.length > 1) console.error('more then one file-explorer');
    else if (leaves.length < 1) console.error('file-explorer not found');
    else {
			if (!this.fileExplorer) this.fileExplorer = leaves[0].view as FileExplorer;
			setupCount(this, revert);
      if (!revert) this.registerVaultEvent();
			if (revert) {
				for (const el of document.getElementsByClassName(withSubfolderClass)) {
					el.removeClass(withSubfolderClass);
				}
			}
			if (this.settings.showAllNumbers) document.body.addClass("oz-show-all-num");
    }
  };

	async onload() {
		console.log('loading FileExplorerNoteCount');
		this.addSettingTab(new FileExplorerNoteCountSettingsTab(this.app, this));
		await this.loadSettings();
		if (this.app.workspace.layoutReady) this.initialize();
    else
      this.registerEvent(
        this.app.workspace.on("layout-ready", this.initialize),
      );
	}

	onunload() {
		console.log('unloading FileExplorerNoteCount');
		this.initialize(true);
	}

	async loadSettings() {
		this.settings = { ...this.settings, ...(await this.loadData()) };
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
