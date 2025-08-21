// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction

$w.onReady(function () {

	// Write your Javascript code here using the Velo framework API

	// Print hello world:
	// console.log("Hello world!");

	// Call functions on page elements, e.g.:
	// $w("#button1").label = "Click me!";

	// Click "Run", or Preview your site, to execute your code
// For Velo in Wix Studio
import { $w } from '@wix/sdk';

$w.onReady(function () {
    // --- Configuration ---
    // IMPORTANT: Replace these IDs with the actual IDs of your elements in Wix Studio
    const headerElementsToChange = [
        $w('#headerLogo'),    // Example: Your logo image or text
        $w('#menuItem1'),     // Example: Your first menu text item
        $w('#menuItem2'),     // Example: Your second menu text item
        $w('#hamburgerIcon'), // Example: Your hamburger menu icon
        // Add all other elements in your header that need to change color
    ];

    const thirdSection = $w('#thirdSection'); // The ID of your third section

    const defaultColor = "#FFFFFF"; // Your header's default color (e.g., white)
    const targetColor = "#000000";  // The color you want it to change to (black)

    // --- Logic ---
    // Function to update the color of header elements
    function updateHeaderColors(color) {
        headerElementsToChange.forEach(element => {
            // Check element type to apply color correctly
            if (element.type === 'Text') {
                element.style.color = color;
            } else if (element.type === 'Image') {
                // If your logo/icon is an SVG or has a color property:
                // You might need to swap image sources if it's a PNG/JPG
                // Example: If you have a white logo and a black logo version
                if (element.id === 'headerLogo') { // Specific logic for the logo
                    if (color === targetColor) {
                        element.src = 'https://static.wixstatic.com/media/your-black-logo-image.png'; // Replace with URL of your black logo
                    } else {
                        element.src = 'https://static.wixstatic.com/media/your-white-logo-image.png'; // Replace with URL of your white logo
                    }
                }
            }
            // Add more conditions for other element types (e.g., vector art, icons)
            // You might need to adjust 'fill' property for SVG icons or use custom CSS classes
        });
    }

    // Function to handle scroll events
    function handleScroll() {
        // Get the bounding rectangle of the third section relative to the viewport
        const thirdSectionRect = thirdSection.global.getBoundingClientRect();

        // Check if the top of the third section is at or above the top of the viewport
        // A small offset (e.g., 10px) can be added for smoother transition
        const triggerPoint = 0; // When the section hits the very top

        if (thirdSectionRect.top <= triggerPoint) {
            // Third section is at or above the top, change header to black
            updateHeaderColors(targetColor);
        } else {
            // Third section is not yet at the top, keep header default color
            updateHeaderColors(defaultColor);
        }
    }

    // --- Event Listeners ---
    // Run the check once on page load to set the initial state
    handleScroll();

    // Attach the scroll event listener to the page
    $w('#page').onScroll(handleScroll);
});
});