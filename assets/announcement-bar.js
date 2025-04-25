// Set fixed height early to prevent CLS
(function () {
  // Set announcement bar height immediately to prevent layout shift
  document.documentElement.style.setProperty(
    "--announcement-bar-height",
    "40px"
  );

  // Fix header spacing without affecting colors or animation behavior
  const headerSpacer = document.querySelector(".header-spacer");
  if (headerSpacer) {
    headerSpacer.style.height = "106px"; // 40px announcement + 66px header
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const containerElem = document.getElementById("announcement-bar");
  const trackElem = document.getElementById("marquee-track");

  // Animation parameters
  const speed = 0.3; // Speed in pixels per frame

  if (!trackElem || !containerElem || trackElem.children.length === 0) return;

  // Fix container height without changing visibility or opacity
  containerElem.style.height = "40px";
  containerElem.style.minHeight = "40px";
  containerElem.style.overflow = "hidden";
  containerElem.style.position = "fixed";
  containerElem.style.top = "0";
  containerElem.style.width = "100%";

  // Make track visible immediately but don't affect colors
  trackElem.style.opacity = "1";
  trackElem.style.minHeight = "40px";
  trackElem.style.position = "relative";
  trackElem.style.whiteSpace = "nowrap";
  trackElem.style.display = "flex";
  trackElem.style.alignItems = "center";

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
  window.addEventListener(
    "resize",
    () => {
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
    },
    { passive: true }
  );
});
