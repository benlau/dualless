

export class SplitOptions {
    constructor(param1, param2, position, orientation, screen) {
        this.param1 = param1;
        this.param2 = param2;
        this.orientation = orientation; // "V" | "H"
        this.position = position;
        
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

        this.openLink = undefined; // Link to open
        this.duplicate = false; // Duplicate the current tab
    }

    setSourceWindowTabId(windowId, tabId) {
        this.sourceWindowId = windowId;
        this.sourceTabId = tabId;
    }

    setOpenLink(link) {
        this.openLink = link;
    }

    setDuplicate() {
        this.duplicate = true;
    }
}