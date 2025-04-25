document.addEventListener("DOMContentLoaded", () => {
  const containerElem = document.getElementById("announcement-bar");
  const trackElem = document.getElementById("marquee-track");

  // Animation parameters
  const speed = 0.3; // Speed in pixels per frame

  if (!trackElem || !containerElem || trackElem.children.length === 0) return;

  // Hide track initially to prevent CLS
  trackElem.style.opacity = "0";

  // Wait for layout to be fully calculated
  setTimeout(() => {
    // Calculate total width of all elements
    let totalWidth = 0;
    const itemElements = [...trackElem.children];

    // Calculate width before cloning elements
    itemElements.forEach((item) => {
      totalWidth +=
        item.offsetWidth +
        parseInt(window.getComputedStyle(item).marginRight || 0);
    });

    // Store original width for later reference
    const originalWidth = totalWidth;

    // Clone elements to ensure continuity (once is enough)
    itemElements.forEach((item) => {
      const clone = item.cloneNode(true);
      trackElem.appendChild(clone);
    });

    // Set initial position
    let position = 0;

    // Make track visible now that everything is ready
    trackElem.style.opacity = "1";

    // Animation function using requestAnimationFrame
    function animate() {
      position -= speed;

      // Reset position when we've scrolled the full width of original elements
      if (Math.abs(position) >= originalWidth) {
        position = 0;
      }

      trackElem.style.transform = `translateX(${position}px)`;
      requestAnimationFrame(animate);
    }

    // Start animation
    requestAnimationFrame(animate);

    // Handle resize for width recalculation
    window.addEventListener("resize", () => {
      // Pause animation briefly during recalculation
      const currentPosition = position;

      // Recalculate width
      let newWidth = 0;
      const firstSetItems = [...trackElem.children].slice(
        0,
        itemElements.length
      );

      firstSetItems.forEach((item) => {
        newWidth +=
          item.offsetWidth +
          parseInt(window.getComputedStyle(item).marginRight || 0);
      });

      // Update the reference width
      totalWidth = newWidth;

      // Adjust position proportionally if we're in the middle of animation
      if (Math.abs(currentPosition) > newWidth) {
        position = 0;
      }
    });
  }, 100); // Small delay to ensure layout is complete
});
