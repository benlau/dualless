
/** Tooltip - A implementation of tooltip
 * 
 */
var sheet = "<link href='widgets/tooltip.css' rel='stylesheet'>";
$("head").append(sheet);

var element = $("<div class='dualless-tooltip'></div>");

export function Tooltip() {
    this.element = element;
    $("body").append(this.element);
}

Tooltip.prototype.show = function () {
    $(this.element).css("display", "block");
}

Tooltip.prototype.hide = function () {
    $(this.element).css("display", "none");
}

Tooltip.prototype.position = function (x, y) {
    $(this.element).css({ top: y });
}

Tooltip.prototype.title = function (title) {
    $(this.element).html("<div class=dualless-tooltip-title>" + title + "</div>");
}