/* WindowManager 
 * 
 * It is the core of Dualless that manages the split , merge , pairing and all windows related
 * operations. 
 * 
 * Events:
 * 
 * - removed        A managed tab is removed 
 * 
 * - focusChanged   The focus of window has been changed. 
 *                  If it is focus on a unmanaged window,
 *                  the window ID will be chrome.windows.WINDOW_ID_NONE
 * 
 * - tabCreated     A new tab is created by WindowManager.
 * 
 */


import { Viewport } from "./viewport.js";
import { os } from "./os.js";
import { EventEmitter } from "./eventemitter.js";
import { TabTracker } from "./tabtracker.js";
import { layout } from "./ops/layout.js";
import { merge } from "./ops/merge.js";
import { log, error } from "./logger.js";
import { pair } from "./ops/pair.js";
import { perferenceInstance } from "./preference.js";

/**
 * @typedef {import('../types/splitcommand').SplitCommand} SplitCommand
 * @typedef {import('./mergeoptions.js').MergeOptions} MergeOptions
 */

function debounce(func, wait) {
    const context = {
    }

    return (...args) => {
        if (context.handler !== undefined) {
            clearTimeout(context.handler);
        }

        context.handler = setTimeout(() => {
            context.handler = undefined;
            func(...args);
        }, wait);
    }
}

class RunQueue {

    constructor() {
        this.queue = [];
        this.isRunning = false;
    }

    enqueue(func) {
        this.queue.push(func);
        this._process();
    }

    // Run a task only if there is no task running
    singleRun(func) {
        if (this.isRunning) {
            return;
        }
        this.enqueue(func);
    }

    async _process() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        while (this.queue.length > 0) {
            const func = this.queue.shift();
            try {
                await func();
            } catch {
                error(`RunQueue: error: ${e}`);
            }
        }
        this.isRunning = false;
    }
}


const MAX_MANAGED_WINDOWS = 2


export class WindowManager {

    constructor() {
        this.os = os();
        this.viewport = new Viewport();
        this.managedWindows = []; // Managed windows

        this.events = new EventEmitter();

        this.tracker = new TabTracker();
        this.tracker.start();

        // this.isRunning = false;

        this.runQueue = new RunQueue();

        this.isRemoveEventFrozen = false;
        this.resumeRemoveEventDebouncer = debounce(() => {
            this.isRemoveEventFrozen = false;
        }, 500);
        this.isFocusEventFrozen = false;
        this.resumeFocusEventDebouncer = debounce(() => {
            this.isFocusEventFrozen = false;
        }, 500);

        chrome.windows.onRemoved.addListener((winId) => {
            this.onWindowRemoved(winId);
        });

        chrome.windows.onFocusChanged.addListener((winId) => {
            this.onWindowFocused(winId);
        });
    }

    isManaged(win) {
        const id = typeof win === "number" ? win : win.id;

        return this.managedWindows.some(function (w) {
            return w.id == id;
        });
    };

    freezeEvent() {
        this.freezeFocusEvent();
        this.freezeRemoveEvent();
    }

    freezeFocusEvent() {
        this.isFocusEventFrozen = true;
        this.resumeFocusEventDebouncer();
    }

    freezeRemoveEvent() {
        this.isRemoveEventFrozen = true;
        this.resumeRemoveEventDebouncer();
    }

    /// Add current Window to managed windows list as the first window
    async updateManagedWindows(currentWindow) {
        // Purge the managed windows list
        const aliveManagedWindows =
            (await chrome.windows.getAll({ populate: true })).filter(w => this.isManaged(w.id));
        this.managedWindows = aliveManagedWindows;

        if (currentWindow) {
            // Move new window to the first of the list
            this.managedWindows = this.managedWindows.filter(w => w.id != currentWindow.id);
            this.managedWindows.unshift(currentWindow);
        }

        // Find another windows
        if (this.managedWindows.length < MAX_MANAGED_WINDOWS) {
            const unmanagedWindows =
                (await chrome.windows.getAll({ populate: true })).filter(w => !this.isManaged(w.id)).slice(0, 1);
            this.managedWindows = this.managedWindows.concat(unmanagedWindows);
        }

        return this.managedWindows;
    }

    async refreshManagedWindows() {
        const aliveManagedWindows =
            (await chrome.windows.getAll({ populate: true })).filter(w => this.isManaged(w.id));
        this.managedWindows = aliveManagedWindows;
        return this.managedWindows;
    }

    removeManagedWindow(winId) {
        this.managedWindows = this.managedWindows.filter(w => w.id != winId);
    }

    /**
     * @param {MergeOptions} mergeOptions
     */

    async merge(mergeOptions, currentWindow) {
        this.runQueue.singleRun(async () => {
            try {
                // if (this.isRunning)  {
                //     return;
                // }
                // this.isRunning = true;
                const updatedManagedWindows = await this.updateManagedWindows(currentWindow);
                const viewport = new Viewport();
                viewport.update(mergeOptions.screen);
                this.freezeEvent();
                log(`merge: viewport ${JSON.stringify(viewport.region.toData())}`);
                await merge(viewport, updatedManagedWindows);
            } catch (e) {
                log(e);
            } finally {
                this.isRunning = false;
            }
        });
    }

    /**
     * @param {SplitCommand} splitCommand
     */

    async split(splitCommand) {
        this.runQueue.singleRun(async () => {
            try {
                const {
                    splitOptions
                } = splitCommand;

                this.viewport.update(splitOptions.screen);

                splitCommand.pairedWindows = await this.updateManagedWindows(splitCommand.currentWindow);

                if (this.managedWindows.length < MAX_MANAGED_WINDOWS ||
                    splitOptions.openLink !== undefined ||
                    splitOptions.duplicate) {
                    await this.createPairedWindow(splitCommand);
                }

                this.freezeEvent();

                await layout(splitCommand);

                // Run pair window again to make sure the focus is correct
                await pair(splitCommand.mainWindow.id, splitCommand.pairedWindows);
            } catch (e) {
                error(`split: ${e}`);
            }
        });
    };

    /** Create a new window for pairing
     * 
     * @param {SplitCommand} splitCommand 
     * @returns 
     */

    async createPairedWindow(splitCommand) {
        // Conditions:
        // 1) openLink from bookmark -> open link in new window
        // 2) duplicate -> duplicate current tab in new window
        // 3) no open link and duplicate -> Move otherTab to new window
        // 4) only one window and one tab

        // Handle duplcate mode
        // Handle tracked tab
        // Futuer: Handle tabs group

        let createOptions = {
            focused: true,
            ...splitCommand.mainWindowRect.toData()
        }

        const {
            splitOptions
        } = splitCommand;

        const otherTabs = splitCommand.currentWindow.tabs
            .map(tab => tab.id)
            .filter(id => id !== splitCommand.currentTab.id);

        let shouldMoveOtherTabs = false;
        let shouldSwap = false; // Should swap main and secondary window

        if (splitOptions.duplicate) {
            createOptions.url = splitCommand.currentTab.url;
            shouldSwap = true;
        } else if (splitOptions.openLink !== undefined) {
            createOptions.url = splitOptions.openLink.url;
            shouldSwap = true;
        } else if (otherTabs.length > 0) {
            createOptions.tabId = otherTabs.shift();
            shouldMoveOtherTabs = true;
        }

        if (shouldSwap) {
            createOptions = { ...createOptions, ...splitCommand.secondaryWindowRect.toData() }
        }

        log(`split: create new window ${JSON.stringify(createOptions)}`);
        const newWindow = await chrome.windows.create(createOptions);
        log(`split: created window: ${newWindow.id}`);

        if (splitCommand.pairedWindows.length > 1) {
            splitCommand.pairedWindows[1] = newWindow;
        } else {
            splitCommand.pairedWindows.push(newWindow);
        }

        if (shouldMoveOtherTabs && otherTabs.length > 0) {
            log(`move tabs ${otherTabs} to window ${newWindow.id}`)
            await chrome.tabs.move(otherTabs, {
                windowId: newWindow.id,
                index: 1
            });
        }

        if (shouldSwap) {
            splitCommand.swap();
        }

        return newWindow;
    }

    async onWindowRemoved(winId) {
        log(`window removed: ${winId}`);
        this.runQueue.enqueue(async () => {
            try {

                if (!this.isManaged(winId)) {
                    log(`window removed: skip - Not a managed window`);
                    return;
                }

                this.removeManagedWindow(winId);

                if (this.isRemoveEventFrozen) {
                    log(`window removed: skip - due to pending event frozen`);
                    return;
                }

                const autoMaximizeModeEnabled = await perferenceInstance.getAutoMaximzeModeEnalbed();

                if (autoMaximizeModeEnabled && this.managedWindows.length > 0) {
                    this.maximize(this.managedWindows[0].id);
                }
                this.freezeRemoveEvent();
            } catch (e) {
                log(`max: error: ${e}`);
            } finally {
            }
        });

    }

    async onWindowFocused(winId) {
        log(`windows focused(${winId})`);

        this.runQueue.singleRun(async () => {
            try {

                if (this.isFocusEventFrozen) {
                    log(`pair(${winId}): skip - event frozen`);
                    return;
                }

                if (!this.isManaged(winId)) {
                    log(`pair(${winId}): skip - not a managed window`);
                    return;
                }

                const pairingModeEnabled = await perferenceInstance.getPairingModeEnabled();

                if (!pairingModeEnabled) {
                    log('pair: pairing mode disabled');
                    return;
                }

                this.refreshManagedWindows();
                if (this.managedWindows.length < 2) {
                    return;
                }

                pair(winId, this.managedWindows);
                this.freezeFocusEvent();
                log(`pair(${winId}): completed`);
            } catch (e) {
                console.trace(e);
                log(`pair: error: ${e}`);
            }
        });
    }

    async maximize(winId) {
        const rect = this.viewport.region.toData();
        log(`maximize: ${winId} ${JSON.stringify(rect)}`);
        await chrome.windows.update(winId, rect);
    };
}