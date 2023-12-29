import {Rect} from "../utils/rect.js";
import {os, isWindows} from "./os.js";

export class Viewport {
	constructor() {
		this.region = new Rect(0, 0, 0, 0); // The workable region
		this._os = os();
	}

	update(scr) {
		this.region = new Rect({top    : scr.availTop,
                			 left   : scr.availLeft,
                		  	 width  : scr.availWidth,
                			 height : scr.availHeight	});

	}
}

