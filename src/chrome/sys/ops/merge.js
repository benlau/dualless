import {log} from "../logger.js";

export async function merge(viewport, windows) {
    const master = windows[0]; // master window ; which will be resized to max viewport size,
    const tabs = []; // Tabs from other managed windows. All the tab inside will be moved to master window,
    const rect = viewport.region.toData();

    windows.map((win, idx) => {
        if (idx > 0) {
            win.tabs.map((tab) => {
                tabs.push(tab.id);
            });
        }
    });

    if (tabs.length > 0) {
        await chrome.tabs.move(tabs,{windowId:master.id, index : master.tabs.length});
    }
    log(`merge: update window ${master.id} with ${JSON.stringify(rect)}`);
    await chrome.windows.update(master.id,rect);
}
