export class MergeOptions {
    constructor(screen) {
        this.screen = {
            width : screen.width,
            height : screen.height,
            avaiLeft: screen.avaiLeft,
            availTop: screen.availTop,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            isExtended: screen.isExtended
        };
        this.sourceWindowId = undefined;
        this.sourceTabId = undefined;
    }

    setSourceWindowTabId(windowId, tabId) {
        this.sourceWindowId = windowId;
        this.sourceTabId = tabId;
    }

}