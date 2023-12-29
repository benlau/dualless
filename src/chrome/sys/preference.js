
import { LocalStorageKey } from "../constants/localstoragekey.js";
import {isMac} from "./os.js";

function isTrue(value) {
    return value === '1' || value === 1 || value === "true" || value === true;
}

class Perference {
    async setAutoMaximizeModeEnabled(enabled) {
        await chrome.storage.local.set({ [LocalStorageKey.AutoMaximizeModeEnabled]: enabled});
    }

    async getAutoMaximzeModeEnalbed() {
        const res = (await chrome.storage.local.get([LocalStorageKey.AutoMaximizeModeEnabled]))
            [LocalStorageKey.AutoMaximizeModeEnabled] ?? true;
        return isTrue(res);
    }

    async getPairingModeEnabled() {
        const defaults = isMac() ? false : true;
        const res = (await chrome.storage.local.get([LocalStorageKey.PairingModeEnabled]))
            [LocalStorageKey.PairingModeEnabled] ?? true;
        return isTrue(res);
    }

    async setPairingModeEnabled(enabled) {
        await chrome.storage.local.set({ [LocalStorageKey.PairingModeEnabled]: enabled});
    }
}

export const perferenceInstance = new Perference();