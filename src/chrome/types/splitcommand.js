import { Viewport } from '../sys/viewport.js';
import { divider } from '../utils/divider.js';

/// The split command
export class SplitCommand {
    constructor(splitOptions, currentWindow, currentTab, os) {
        this.splitOptions = splitOptions;
        this.currentWindow = currentWindow;
        this.currentTab = currentTab;

        // The screen viewport
        this.viewport = new Viewport();
        this.viewport.update(splitOptions.screen);

        // The paired windows
        this.pairedWindows = [];

        this.os = os;
        this.regions = [];

        this.calcRegions();
    }

    /** The main window which will got focus after split.
     * It could be changed by swap()
     */ 

    get mainWindow () {
        return this.pairedWindows[0];
    }

    get mainWindowRect() {
        return this.regions[0];
    }

    get secondaryWindow () {
        return this.pairedWindows[1];
    }

    get secondaryWindowRect() {
        return this.regions[1];
    }

    calcRegions() {
        this.regions = divider(this.viewport, this.splitOptions);
    }

    swap() {
        const tmp = this.pairedWindows[0];
        this.pairedWindows[0] = this.pairedWindows[1];
        this.pairedWindows[1] = tmp;

        const tmpRect = this.regions[0];
        this.regions[0] = this.regions[1];
        this.regions[1] = tmpRect;
    }

}

