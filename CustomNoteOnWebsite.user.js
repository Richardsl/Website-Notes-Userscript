// ==UserScript==
// @name        richard.sl - Custom Note On Website
// @namespace   www.richard.sl Scripts
// @match       *://www.richard.sl/*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @version     2
// @author      Richard Slettevoll
// @description created: 2023-11-03, 18:13:32
// ==/UserScript==

// set variable with current unix timestamp at the time of page load
var unixTimestamp = (new Date()).getTime();
//console.log('Custom Note On Website script started at ' + unixTimestamp);

// Retrieve stored values or use defaults
var textareaText = GM_getValue('textareaText', 'Hello World\nThis is the second line\nAnd this is the third one.');
var overlayDivWidth = GM_getValue('overlayDivWidth', 200);
var overlayDivHeight = GM_getValue('overlayDivHeight', 100);
var overlayTop = GM_getValue('overlayTop', 50);
var overlayLeft = GM_getValue('overlayLeft', 50);
var backgroundColor = GM_getValue('backgroundColor', '#90ee90');
var borderColor = GM_getValue('borderColor', '#333');
var overlayTopPadding = GM_getValue('overlayTopPadding', 5);

// Create the overlay div with the textarea inside and values from above
var overlay = document.createElement('div');
document.body.appendChild(overlay); // Append early to set styles properly

// Apply styles to the overlay
overlay.style.position = 'fixed';
overlay.style.top = overlayTop + 'px'; // Set top with 'px'
overlay.style.left = overlayLeft + 'px'; // Set left with 'px'
overlay.style.padding = overlayTopPadding + 'px 0px 0px 0px'; // Set padding with 'px'
overlay.style.backgroundColor = backgroundColor;
overlay.style.border = '2px solid ' + borderColor;
overlay.style.boxSizing = 'content-box';
overlay.style.cursor = 'move';
overlay.style.zIndex = '10000';
overlay.style.width = overlayDivWidth + 'px'; // Set width with 'px'
overlay.style.height = overlayDivHeight + 'px'; // Set height with 'px'

// Create the textarea for multi-line text
var textArea = document.createElement('textarea');
overlay.appendChild(textArea); // Append early to set styles properly

// Apply styles to the textarea
textArea.style.width = (overlayDivWidth - (overlayTopPadding * 2)) + 'px'; // Set width with 'px'
textArea.style.height = (overlayDivHeight - (overlayTopPadding * 2)) + 'px'; // Set height with 'px'
textArea.style.boxSizing = 'content-box';
textArea.style.resize = 'both'; // Allow resizing
textArea.value = textareaText; // Use 'value' for textarea content

// textareaResizeObserver to resize the overlay div when the textarea is resized by the user (but not save state)
var textareaResizeObserver = new ResizeObserver(function (entries) {
    // if 1 secs has passed since page load
    if (((new Date()).getTime() - unixTimestamp) > 1000) {
        for (var entry of entries) {
            //console.log('textareaResizeObserver, w:' + entry.contentRect.width + " h:" + entry.contentRect.height);
            var contentRect = entry.contentRect;
            overlay.style.width = contentRect.width + overlayTopPadding + 4 + 'px';
            overlay.style.height = contentRect.height + overlayTopPadding + 4 + 'px';
        }

        saveWidthHeightState();
    }
});
textareaResizeObserver.observe(textArea);

// save the position of the overlay box minus the 'px' at the end
function savePositionState() {
    //console.log('savePositionState, l:' + overlay.style.left + " t:" + overlay.style.top);
    GM_setValue('overlayTop', overlay.style.top.slice(0, -2));
    GM_setValue('overlayLeft', overlay.style.left.slice(0, -2));
}
// Make overlay div movable
overlay.onmousedown = function (event) {
    if (event.target === textArea) {
        // Allow normal interactions with the textarea
        return;
    }

    event.preventDefault();

    var startX = event.clientX;
    var startY = event.clientY;

    function onMouseMove(event) {
        var deltaX = event.clientX - startX;
        var deltaY = event.clientY - startY;

        overlay.style.left = (parseInt(overlay.style.left, 10) + deltaX) + 'px';
        overlay.style.top = (parseInt(overlay.style.top, 10) + deltaY) + 'px';

        startX = event.clientX;
        startY = event.clientY;
    }

    document.addEventListener('mousemove', onMouseMove);

    document.addEventListener('mouseup', function mouseUpHandler() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', mouseUpHandler);
        savePositionState(); // Save the position after moving

    }, { once: true });
};

// save textarea content
function savetextareaTextState() {
    //console.log('savetextareaTextState saved');
    GM_setValue('textareaText', textArea.value);
}
textArea.addEventListener('input', savetextareaTextState);

// save width and height when 1 second has passed since last resize, but not during first 1 sec of page initial load
var lastSavedTimestamp = unixTimestamp;
function saveWidthHeightState() {
    //console.log('saveWidthHeightState saved');
    // if 2 secs has passed since page load, save width and height
    if (((new Date()).getTime() - unixTimestamp) > 2000) {

        // if 0.1 sec has passed since last save, save width and height
        if (((new Date()).getTime() - lastSavedTimestamp) > 100) {
            GM_setValue('overlayDivWidth', overlay.style.width.slice(0, -2));
            GM_setValue('overlayDivHeight', overlay.style.height.slice(0, -2));
            // set new unixTimestamp for last save time
            lastSavedTimestamp = (new Date()).getTime();
        }
    }
}

