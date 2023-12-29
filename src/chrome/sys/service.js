/* WindowManager services
 */

/**
 * @typedef {import('./splitoptions').SplitOptions} SplitOptions
 * @typedef {import('../types/mergecommand').MergeOptions} MergeOptions
 */

export class WindowManagerService {
    constructor() {
        this._win = undefined;
        this._tab = undefined;
        this._screen = undefined;
    }

    /**
     * 
     * @param {SplitOptions} splitOptions 
     */
    async split(splitOptions) {
        const { window, tab } = await this.getCurrentWindowTab();
        splitOptions.setSourceWindowTabId(window.id, tab.id);

        const message = {
            type: 'dualless.split',
            payload: splitOptions
        }

        chrome.runtime.sendMessage(message, (response) => {
            console.log({ response });
        });

        // Unlike previous implementation, current window will
        // never been changed. So it do not need to update the 
        // current window
    }

    /**
     * @param {MergeOptions} mergeOptions 
     */

    async merge(mergeOptions) {
        const { window, tab } = await this.getCurrentWindowTab();

        const message = {
            type: 'dualless.merge',
            payload: mergeOptions
        }
        mergeOptions.setSourceWindowTabId(window.id, tab.id);

        chrome.runtime.sendMessage(message, () => { });
    }

    static window() {
        return this._win;
    }

    static tab() {
        return this._tab;
    }

    async currentTab() {
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });
        return tabs[0];
    }

    currentWindow() {
        return chrome.windows.getCurrent({ populate: true });
    }

    async getCurrentWindowTab() {
        const window = await chrome.windows.getCurrent({ populate: true });
        const tab = window.tabs.find(tab => tab.active);

        return {
            window,
            tab
        }
    }

    isMaximized(win) {
        var res;

        if (win.state != undefined) { // Working method for new version of Chrome
            return win.state == "maximized";
        }

        // Old version of Chrome do not provide any method to check window status.

        if (this._os == "Windows") {
            // Dirty hack for windows
            res = (win.left == -8 && win.top == -8 && win.width == window.screen.availWidth + 16);
        } else if (this._os == "MacOS") {
            res = false; // MacOS do not have the concept of maximize.
        } else {
            // It do not works for Unity
            res = (win.left == 0 && win.width == window.screen.availWidth);
        }
        return res;
    }

    getDisplayInfo() {
        return chrome.system.display.getInfo();
    }

    async getLog() {
        return new Promise((resolve, reject) => {

            const message = {
                type: 'dualless.getLog',
            }

            chrome.runtime.sendMessage(message, (response) => {
                console.log({ response });
                resolve(response.log);
            });
        });
    }
}

export const windowManageServiceInstance = new WindowManagerService();
