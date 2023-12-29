/** Arrange the given windows according to the options.
 */

import { resize } from "./resize.js";
import { divider } from "../../utils/divider.js";
import { log } from "../logger.js";
import { Rect } from "../../utils/rect.js";

/**
 * @typedef {import("../../utils/rect.js").Rect} Rect
 * @typedef {import("../../types/splitcommand.js").SplitCommand} SplitCommand 
 * * 
 */

/**
 * 
 * @param {SplitCommand} splitCommand 
 */

export async function layout(splitCommand) {
    let maxRunCount = 2;
    // May retry for layout depend on the OS without resize the viewport
    // Unlike v3.0, retry is not limited to Linux only. Since the retry mechanism
    // is changed to solve the min size problem in Chrome window

    const {
        pairedWindows,
        splitOptions,
        os,
    } = splitCommand;

    if (pairedWindows.length != 2) {
        throw "layout - The input windows size must be 2.";
    }
    let dividedRegions = divider(splitCommand.viewport, splitOptions); // The rectangles of window.
    let counter = 0;

    // Try to arrange the windows
    const run = async (rects) => {
        log(`layout: [${pairedWindows.map(win => win.id)}][${rects}]`)

        const actions = pairedWindows.map((pairedWindow, index) => {
            const updateInfo = {
                ...rects[index].toData(),
                focused: index === 0, // Focus the main window
            };

            return {
                window: pairedWindow,
                updateInfo,
            }
        }).reverse();
        // Move non-focused window first
        
        const res = []
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            res.push(await resize({
                window: action.window,
                updateInfo: action.updateInfo,
                os: splitOptions.os,
            }));
            // Focused window should be the last window to resize
        }
        return res;
    }

    if (os == "Linux") {
        maxRunCount++;
        // The first retry will handle the minimium window size problem in Chrome
        // The second retry is made for Ubuntu/Unity , 
        // somtimes the window may not on the correct position.
        // Try one more time should fix the problem.
    }

    let imperfect = true; // The result is imperfect
    while (maxRunCount > 0 && imperfect) {
        const updatedWindowRects = await run(dividedRegions);

        const splittedRects = updatedWindowRects.map(win => new Rect(win));

        imperfect = splittedRects[0].intersect(splittedRects[1]).size() > 0;
        maxRunCount = maxRunCount - 1;

        if (imperfect) {
            var minSize = {
                width: Math.min(splittedRects[0].width, splittedRects[1].width),
                height: Math.min(splittedRects[0].height, splittedRects[1].height),
            }
            dividedRegions = divider(splitCommand.viewport, splitOptions, minSize);
        }
    }
};
