/* Pair Display Tool */

import { error, log } from "../logger.js";

class PairLayout {

	constructor() {
	}

	async pair(focusWinId, windows) {
		try {

			if (windows.length < 2 || focusWinId == chrome.windows.WINDOW_ID_NONE) {
				return;
			}

			const updatedWindows = await Promise.all(windows.map(async win => {
				return chrome.windows.get(win.id);
			}));

			// Ignore if window minimized
			if (updatedWindows.some(win => win.state == "minimized")) {
				return;
			}

			const activeWinPos = windows[1].id == focusWinId ? 1 : 0;
			const inactiveWinPos = 1 - activeWinPos;
			await chrome.windows.update(windows[inactiveWinPos].id, { focused: true });
			await chrome.windows.update(windows[activeWinPos].id, { focused: true });	

			log(`piar: paired ${windows.map(w => w.id)}`)
		} catch (e) {
            error(`pair: ${e}`);
		}
	}
}

const instance = new PairLayout();

export async function pair(focusWinId, windows) {
	await instance.pair(focusWinId, windows);
}
