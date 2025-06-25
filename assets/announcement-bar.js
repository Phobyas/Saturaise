// Optimized announcement-bar.js - Reduced execution time and main thread blocking
(function () {
  // Set fixed height early to prevent CLS - using requestIdleCallback if available
  const setInitialStyles = () => {
    document.documentElement.style.setProperty(
      "--announcement-bar-height",
      "40px"
    );

    const headerSpacer = document.querySelector(".header-spacer");
    if (headerSpacer) {
      headerSpacer.style.height = "106px";
    }
  };

  // Use requestIdleCallback if available, otherwise fallback to immediate execution
  if ("requestIdleCallback" in window) {
    requestIdleCallback(setInitialStyles);
  } else {
    setInitialStyles();
  }
})();

// Use passive event listeners and optimize for performance
const initAnnouncementBar = () => {
  const containerElem = document.getElementById("announcement-bar");
  const trackElem = document.getElementById("marquee-track");

  // Early return if elements don't exist
  if (!trackElem || !containerElem || trackElem.children.length === 0) return;

  // Use CSS for fixed styling instead of JavaScript
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    #announcement-bar {
      height: 40px !important;
      min-height: 40px !important;
      overflow: hidden !important;
      position: fixed !important;
      top: 0 !important;
      width: 100% !important;
    }
    #marquee-track {
      opacity: 1 !important;
      min-height: 40px !important;
      position: relative !important;
      white-space: nowrap !important;
      display: flex !important;
      align-items: center !important;
    }
  `;
  document.head.appendChild(styleSheet);

  // Animation parameters - reduced for better performance
  const speed = 0.25; // Slightly reduced speed for smoother animation
  let position = 0;
  let animationId;
  let isAnimating = false;

  // Calculate total width once
  const itemElements = [...trackElem.children];
  let totalWidth = itemElements.reduce((width, item) => {
    return (
      width +
      item.offsetWidth +
      parseInt(window.getComputedStyle(item).marginRight || 0)
    );
  }, 0);

  // Clone elements only once
  itemElements.forEach((item) => {
    const clone = item.cloneNode(true);
    trackElem.appendChild(clone);
  });

  // Optimized animation function using requestAnimationFrame
  const animate = () => {
    if (!isAnimating) return;

    position -= speed;

    if (Math.abs(position) >= totalWidth) {
      position = 0;
    }

    // Use transform3d for hardware acceleration
    trackElem.style.transform = `translate3d(${position}px, 0, 0)`;
    animationId = requestAnimationFrame(animate);
  };

  // Start animation
  const startAnimation = () => {
    if (isAnimating) return;
    isAnimating = true;
    animationId = requestAnimationFrame(animate);
  };

  // Stop animation
  const stopAnimation = () => {
    isAnimating = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };

  // Use Intersection Observer to only animate when visible
  let observer;
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation();
          } else {
            stopAnimation();
          }
        });
      },
      { threshold: 0 }
    );

    observer.observe(containerElem);
  } else {
    // Fallback for browsers without IntersectionObserver
    startAnimation();
  }

  // Optimized resize handler with debouncing
  let resizeTimeout;
  const handleResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
      // Recalculate width only if needed
      const firstSetItems = [...trackElem.children].slice(
        0,
        itemElements.length
      );
      const newWidth = firstSetItems.reduce((width, item) => {
        return (
          width +
          item.offsetWidth +
          parseInt(window.getComputedStyle(item).marginRight || 0)
        );
      }, 0);

      if (Math.abs(newWidth - totalWidth) > 5) {
        // Only update if significant change
        totalWidth = newWidth;
        if (Math.abs(position) > totalWidth) {
          position = 0;
        }
      }
    }, 150); // Debounce resize events
  };

  window.addEventListener("resize", handleResize, { passive: true });

  // Cleanup function
  return () => {
    stopAnimation();
    if (observer) observer.disconnect();
    window.removeEventListener("resize", handleResize);
    if (resizeTimeout) clearTimeout(resizeTimeout);
  };
};

// Initialize when DOM is ready or immediately if already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAnnouncementBar, {
    once: true,
  });
} else {
  // Use requestIdleCallback for non-critical initialization
  if ("requestIdleCallback" in window) {
    requestIdleCallback(initAnnouncementBar);
  } else {
    setTimeout(initAnnouncementBar, 0);
  }
}
