// Create a header spacer element before content loads to avoid layout shifts
(function () {
  // Set CSS variables early
  document.documentElement.style.setProperty("--header-height", "66px");
  document.documentElement.style.setProperty(
    "--announcement-bar-height",
    "40px"
  );
  document.documentElement.style.setProperty("--mobile-header-height", "60px");
})();

// Function to create header spacer
function createHeaderSpacer() {
  if (document.querySelector(".header-spacer")) return;

  const spacer = document.createElement("div");
  spacer.className = "header-spacer";

  const pageWrap = document.querySelector(".page-wrap");
  if (pageWrap && pageWrap.firstElementChild) {
    pageWrap.insertBefore(spacer, pageWrap.firstElementChild);
  }
}

// Mobile drawer setup
function setupDrawer() {
  const mobileNav = document.querySelector(".js-mobile-header");
  const mobileSearch = document.getElementById("mobile-search");
  const announcementBar = document.querySelector(".announcement-bar.wrapper");

  // Ensure announcement bar is visible
  if (announcementBar) {
    announcementBar.style.display = "block";
    // Remove any inline transform that might be causing issues
    announcementBar.style.transform = "";
  }

  // Event handlers for slideout drawer
  Events.on("slideout:open:mobile-navigation", () => {
    if (mobileNav) setTimeout(() => (mobileNav.style.zIndex = "14"), 200);
  });

  Events.on("slideout:close:mobile-navigation", () => {
    setTimeout(() => {
      if (mobileSearch) mobileSearch.style.zIndex = "0";
      if (mobileNav) mobileNav.style.zIndex = "12";
    }, 200);
  });
}

// Mobile search setup
function setupMobileSearch() {
  const searchToggle = document.querySelector(".js-mobile-search-toggle");
  const mobileSearch = document.getElementById("mobile-search");
  const mobileHeader = document.querySelector(".mobile-nav__mobile-header");
  const backdrop = document.querySelector(".mobile-search-backdrop");

  if (!searchToggle || !mobileSearch || !mobileHeader) return;

  searchToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    mobileSearch.classList.toggle("mobile-search--visible");
    backdrop.classList.toggle("is-active");

    if (mobileSearch.classList.contains("mobile-search--visible")) {
      mobileHeader.style.zIndex = "15";
      mobileHeader.style.opacity = "1";
      // Use top positioning consistently instead of transform
      if (mobileHeader.classList.contains("announcement-hidden")) {
        mobileHeader.style.top = "0px";
      } else {
        mobileHeader.style.top = "var(--announcement-bar-height, 40px)";
      }
    }
  });

  backdrop.addEventListener("click", function () {
    mobileSearch.classList.remove("mobile-search--visible");
    backdrop.classList.remove("is-active");
  });
}

// Handle scroll behavior for header and announcement bar
function handleMobileHeaderScroll() {
  const announcementBar = document.querySelector(".announcement-bar.wrapper");
  const mobileHeader = document.querySelector(".mobile-nav__mobile-header");

  // Check if we're on mobile - only apply this behavior on mobile devices
  if (!announcementBar || !mobileHeader || window.innerWidth >= 768) return;

  let scrollTimeout;
  let lastScrollTop = 0;
  const scrollThreshold = 10;

  function onScroll() {
    if (scrollTimeout) return;

    scrollTimeout = setTimeout(() => {
      const currentScrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (currentScrollTop > scrollThreshold) {
        // Only add these classes on mobile
        announcementBar.classList.add("is-hidden");
        mobileHeader.classList.add("announcement-hidden");
      } else {
        announcementBar.classList.remove("is-hidden");
        mobileHeader.classList.remove("announcement-hidden");
      }

      lastScrollTop = currentScrollTop;
      scrollTimeout = null;
    }, 10);
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  // Also handle resize events to apply or remove mobile behavior
  window.addEventListener(
    "resize",
    function () {
      if (window.innerWidth < 768) {
        // We're on mobile now, make sure the handler is active
        window.removeEventListener("scroll", onScroll);
        window.addEventListener("scroll", onScroll, { passive: true });
      } else {
        // We're on desktop now, remove the mobile scroll handler
        window.removeEventListener("scroll", onScroll);
        // Reset any mobile-specific classes
        announcementBar.classList.remove("is-hidden");
        mobileHeader.classList.remove("announcement-hidden");
      }
    },
    { passive: true }
  );
}

// Initialize on DOM ready to avoid layout shifts
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Main initialization function
function init() {
  createHeaderSpacer();

  // Clean up problematic styles
  document.querySelectorAll(".slideshow__slide-image").forEach((slide) => {
    if (slide.style.paddingBottom) slide.style.paddingBottom = "";
  });

  document
    .querySelectorAll('[data-section-type="mobile-header"]')
    .forEach((container) => {
      if (typeof WAU !== "undefined" && WAU.Slideout) {
        WAU.Slideout.init("mobile-navigation");
      }
      setupDrawer();
      setupMobileSearch();
      handleMobileHeaderScroll();
    });
}

// Shopify section handlers
document.addEventListener("shopify:section:select", function (event) {
  const container = event.target.querySelector(
    '[data-section-type="mobile-header"]'
  );
  if (!container) return;

  if (
    typeof WAU !== "undefined" &&
    (WAU.Helpers.isTouch() || WAU.Helpers.isMobile())
  ) {
    WAU.Slideout._openByName("mobile-navigation");
    setupDrawer();
  }
});

document.addEventListener("shopify:section:deselect", function (event) {
  if (
    event.target.querySelector('[data-section-type="mobile-header"]') &&
    typeof WAU !== "undefined"
  ) {
    WAU.Slideout._closeByName("mobile-navigation");
  }
});

document.addEventListener("shopify:block:select", function (event) {
  if (!event.target.querySelector('[data-section-type="mobile-header"]'))
    return;

  if (
    typeof WAU !== "undefined" &&
    (WAU.Helpers.isTouch() || WAU.Helpers.isMobile())
  ) {
    WAU.Slideout._openByName("mobile-navigation");
    setupDrawer();
  }
});
