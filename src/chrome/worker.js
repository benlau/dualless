import { WindowManager } from "./sys/windowmanager.js";
import { SplitCommand } from "./types/splitcommand.js";
import { getLog, log } from "./sys/logger.js";

const windowManager = new WindowManager();

async function getWindowTab(windwowId, tabId) {
	const window = await chrome.windows.get(windwowId, { populate: true });
	const tab = window.tabs.find(tab => tab.id === tabId);

	return {
		window,
		tab
	}
}

function listen() {
	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
			const {
				type,
				payload
			} = request;

			if (type === 'dualless.split') {
				getWindowTab(payload.sourceWindowId, payload.sourceTabId).then(({ window, tab }) => {
					const splitCommand = new SplitCommand(payload, window, tab, windowManager.os);
					windowManager.split(splitCommand);
				});
				sendResponse({ status: "ok" });
				return;
			} else if (type === "dualless.merge") {
				getWindowTab(payload.sourceWindowId, payload.sourceTabId).then(({ window }) => {
					windowManager.merge(payload, window);
				});
				sendResponse({ status: "ok" });
				return;
			} else if (type === "dualless.getLog") {
				sendResponse({
					status: "ok",
					log: getLog()
				})
			};
		}
	);
}


async function init() {
	log("Dualless launched");

	listen();
}

init();


