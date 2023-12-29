import { Rect } from "./rect.js"
import { isWindows } from "../sys/os.js";

function enlargeToMinSize(rects, minSize) {
    var smallerCount = 0, // no. of rect which is less then the minSize
        min; // The min rectangle

    if (minSize === undefined)
        minSize = { width: 0, height: 0 };

    for (var i = 0; i < rects.length; i++) {
        if (rects[i].width < minSize.width ||
            rects[i].height < minSize.height) {
            smallerCount++;
            min = rects[i];
        }
    }

    if (smallerCount == 1) {

        // Ignore 0 or 2.
        // If the count is 2, it has no way to adjust.
        var dw = minSize.width - min.width,
            dh = minSize.height - min.height;
        if (dw < 0)
            dw = 0;
        if (dh < 0)
            dh = 0;

        for (var i = 0; i < rects.length; i++) {
            if (rects[i].width < minSize.width ||
                rects[i].height < minSize.height) {

                rects[i].width += dw;
                rects[i].height += dh;

                if (i === 1) { // It is on the right / bottom
                    rects[i].left -= dw;
                    rects[i].top -= dh;
                }

            } else {
                rects[i].width -= dw;
                rects[i].height -= dh;

                if (i === 1) { // It is on the right / bottom
                    rects[i].left += dw;
                    rects[i].top += dh;
                }
            }
        }
    }
}

export function divider(viewport, splitOptions, minSize) {
    const region = viewport.region;
    var param1 = splitOptions.param1;
    var param2 = splitOptions.param2;
    var orientation = splitOptions.orientation;
    var position = splitOptions.position;

    var ratio = param1 / (param1 + param2);

    var left = region.left;
    var top = region.top;
    var width = region.width;
    var height = region.height;

    var length; // The length of rect1 (depend on orientation)        

    if (orientation == "H") {
        length = parseInt(width * ratio, 10);
        width = length;
    } else {
        length = parseInt(height * ratio, 10);
        height = length;
    }

    var rect1 = new Rect({
        left: left,
        top: top,
        width: width,
        height: height
    });

    // 1 pixel overlappping
    if (orientation == "H") {
        left = left + length;
        width = region.width - length - 1;
    } else {
        top = top + length;
        height = region.height - length - 1;
    }

    var rect2 = new Rect({
        left: left,
        top: top,
        width: width,
        height: height
    });

    var res = [rect1, rect2];

    enlargeToMinSize(res, minSize);

    if (position !== 0)
        res = [rect2, rect1];

    if (isWindows()) {
        // 8 pixel border for Windows version
        res.forEach(rect => {
            const MARGIN = 8;
            rect.enlarge(MARGIN,MARGIN,MARGIN * 2,MARGIN * 2);
        });
    }

    return res;
};

