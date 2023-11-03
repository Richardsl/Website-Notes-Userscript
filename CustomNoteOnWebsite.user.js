// ==UserScript==
// @name        richard.sl - myDescription
// @namespace   richard.sl Scripts
// @match       *://www.richard.sl/*
// @version     1.0
// @author      Richard Slettevoll
// @description created: 2023-11-03, 18:13:32
// ==/UserScript==

// Script configuration: Start
var overlayText = `Hello World
This is the second line
And this is the third one.`;
var initialTop = '50px'; // Change this to set the initial vertical position
var initialLeft = '50px'; // Change this to set the initial horizontal position
var initialWidth = '200px'; // Change this to set the initial width of the textarea
var initialHeight = '100px'; // Change this to set the initial height of the textarea
var backgroundColor = '#90ee90'; // Light green background for eye-pleasing color
var borderColor = '#333'; // Border color
// Script configuration: End

// Create the overlay
var overlay = document.createElement('div');
overlay.style.position = 'fixed';
overlay.style.top = initialTop;
overlay.style.left = initialLeft;
overlay.style.padding = '10px';
overlay.style.backgroundColor = backgroundColor;
overlay.style.border = '2px solid ' + borderColor; // Slight border
overlay.style.boxSizing = 'border-box';
overlay.style.cursor = 'move';
overlay.style.zIndex = '10000';

// Create the textarea for multi-line text
var textArea = document.createElement('textarea');
textArea.style.width = initialWidth;
textArea.style.height = initialHeight;
textArea.style.resize = 'both'; // Allow resizing
textArea.textContent = overlayText;

// Create a span to show position offset
var offsetDisplay = document.createElement('span');
offsetDisplay.style.position = 'absolute';
offsetDisplay.style.bottom = '100%'; // Position above the overlay
offsetDisplay.style.left = '0';
offsetDisplay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
offsetDisplay.style.padding = '2px 5px';
offsetDisplay.style.display = 'none'; // Initially hidden
overlay.appendChild(offsetDisplay);

// Create a span to show size during resize
var sizeDisplay = document.createElement('span');
sizeDisplay.style.position = 'absolute';
sizeDisplay.style.top = '100%'; // Position below the textarea
sizeDisplay.style.left = '0';
sizeDisplay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
sizeDisplay.style.padding = '2px 5px';
sizeDisplay.style.display = 'none'; // Initially hidden
overlay.appendChild(sizeDisplay);

// Append the textarea to the overlay
overlay.appendChild(textArea);

// Append the overlay to the body
document.body.appendChild(overlay);

// Function to update the offset display
function updateOffsetDisplay(x, y) {
    offsetDisplay.textContent = `Position: X ${x}px, Y ${y}px`;
    offsetDisplay.style.display = 'block';
}

// Function to hide the offset display
function hideOffsetDisplay() {
    offsetDisplay.style.display = 'none';
}

// Function to update the size display
function updateSizeDisplay(w, h) {
    sizeDisplay.textContent = `Size: W ${w}px, H ${h}px`;
    sizeDisplay.style.display = 'block';
}

// Function to hide the size display
function hideSizeDisplay() {
    sizeDisplay.style.display = 'none';
}

// Make the overlay movable
overlay.onmousedown = function (event) {
    if (event.target === textArea) {
        // Allow normal interactions with the textarea
        return;
    }

    event.preventDefault();

    var startX = overlay.offsetLeft;
    var startY = overlay.offsetTop;
    var mouseX = event.clientX;
    var mouseY = event.clientY;

    function onMouseMove(event) {
        var deltaX = event.clientX - mouseX;
        var deltaY = event.clientY - mouseY;

        var newLeft = startX + deltaX;
        var newTop = startY + deltaY;

        overlay.style.left = newLeft + 'px';
        overlay.style.top = newTop + 'px';

        updateOffsetDisplay(newLeft, newTop);
    }

    document.addEventListener('mousemove', onMouseMove);

    overlay.onmouseup = function () {
        document.removeEventListener('mousemove', onMouseMove);
        overlay.onmouseup = null;
        hideOffsetDisplay();
    };
};

// Add resize functionality to the textarea
textArea.addEventListener('mousedown', function (event) {
    // Stop propagation to prevent the overlay drag functionality from triggering
    event.stopPropagation();
    hasBeenResized = true; // Set the flag to true when starting to resize
});

// Flag to check if the textarea has been interacted with
var hasBeenResized = false;

// Monitor the resize events on the textarea
var resizeObserver = new ResizeObserver(function (entries) {
    if (hasBeenResized) { // Only display size if the flag is true
        for (let entry of entries) {
            var boxRect = entry.target.getBoundingClientRect();
            updateSizeDisplay(boxRect.width, boxRect.height);
        }
    }
});
resizeObserver.observe(textArea);

// When starting to resize, set the flag to true
textArea.addEventListener('mousedown', function () {
    hasBeenResized = true;
});

// Disable the default drag handler to prevent conflicts
overlay.ondragstart = function () {
    return false;
};

// To ensure the size display disappears after resizing
document.addEventListener('mouseup', function () {
    if (hasBeenResized) { // Check if there was a resize action
        hideSizeDisplay(); // Hide the size display
        hasBeenResized = false; // Reset the flag
    }
});
