// Mobile Navigation JS - Updated to improve performance and prevent CLS
// Set initial CSS variables to prevent layout shift
(function () {
  document.documentElement.style.setProperty("--header-mobile-height", "66px");
  document.documentElement.style.setProperty("--header-height", "66px");
  document.documentElement.style.setProperty(
    "--announcement-bar-height",
    "40px"
  );

  // Pre-set fixed dimensions for critical elements
  const headerSpacer = document.querySelector(".header-spacer");
  if (headerSpacer) {
    headerSpacer.style.height = "106px"; // 40px + 66px
  }
})();

function setupDrawer() {
  // Find key elements
  const mobileHeader = document.getElementById("shopify-section-mobile-header");
  const mobileNav = document.querySelector(".js-mobile-header");
  const mobileSearch = document.getElementById("mobile-search");
  const announcementBar = document.querySelector(".announcement-bar.wrapper");

  // Set header height and announcement bar height with fixed values to prevent CLS
  const headerHeight = 66; // Fixed height
  const announcementBarHeight = announcementBar
    ? announcementBar.offsetHeight || 40
    : 40;

  // Update CSS variables
  document.documentElement.style.setProperty(
    "--header-height",
    `${headerHeight}px`
  );
  document.documentElement.style.setProperty(
    "--announcement-bar-height",
    `${announcementBarHeight}px`
  );

  // Update the header-spacer
  const headerSpacer = document.querySelector(".header-spacer");
  if (headerSpacer && window.innerWidth < 768) {
    headerSpacer.style.height = `${announcementBarHeight + headerHeight}px`;
  }

  // Ensure announcement bar is visible
  if (announcementBar) {
    announcementBar.style.display = "block";
    announcementBar.style.visibility = "visible";
    announcementBar.style.opacity = "1";
    announcementBar.style.position = "fixed";
    announcementBar.style.top = "0";
    announcementBar.style.height = `${announcementBarHeight}px`;
  }

  // Handle slideout events if WAU is available
  if (typeof Events !== "undefined") {
    Events.on("slideout:open:mobile-navigation", function () {
      setTimeout(function () {
        if (mobileNav) mobileNav.style.zIndex = "14";
      }, 200);
    });

    Events.on("slideout:close:mobile-navigation", function () {
      setTimeout(function () {
        if (mobileSearch) mobileSearch.style.zIndex = "0";
        if (mobileNav) mobileNav.style.zIndex = "12";
      }, 200);
    });
  }

  // Fix dimensions for icon containers
  const iconContainers = document.querySelectorAll(
    ".mobile-header__cart-links--search, .mobile-header__cart-links--cart, .mobile-header__cart-links--nav"
  );

  iconContainers.forEach((container) => {
    if (container) {
      container.style.width = "32px";
      container.style.height = "32px";
    }
  });
}

function setupMobileSearch() {
  const searchToggle = document.querySelector(".js-mobile-search-toggle");
  const mobileSearch = document.getElementById("mobile-search");
  const mobileHeader = document.querySelector(".mobile-nav__mobile-header");
  const backdrop = document.querySelector(".mobile-search-backdrop");

  if (searchToggle && mobileSearch && mobileHeader) {
    // Create a fixed position handler for the search
    const positionSearchAndBackdrop = () => {
      const headerHeight = 66; // Fixed height to prevent CLS
      const announcementHeight =
        document.querySelector(".announcement-bar.wrapper")?.offsetHeight || 40;

      if (mobileHeader.classList.contains("announcement-hidden")) {
        mobileSearch.style.top = `${headerHeight}px`;
        if (backdrop) backdrop.style.top = `${headerHeight + 60}px`;
      } else {
        mobileSearch.style.top = `${headerHeight + announcementHeight}px`;
        if (backdrop)
          backdrop.style.top = `${headerHeight + announcementHeight + 60}px`;
      }
    };

    searchToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      mobileSearch.classList.toggle("mobile-search--visible");
      backdrop.classList.toggle("is-active");

      positionSearchAndBackdrop();

      if (mobileSearch.classList.contains("mobile-search--visible")) {
        mobileHeader.style.zIndex = "15";

        // Focus search input
        const searchInput = mobileSearch.querySelector(
          ".section-header__mobile_search--input"
        );
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 50);
        }
      }
    });

    backdrop.addEventListener("click", function () {
      mobileSearch.classList.remove("mobile-search--visible");
      backdrop.classList.remove("is-active");
    });

    // Update search position on scroll for smoother experience
    window.addEventListener("scroll", positionSearchAndBackdrop, {
      passive: true,
    });
  }
}

function handleMobileHeaderScroll() {
  const announcementBar = document.querySelector(".announcement-bar.wrapper");
  const mobileHeader = document.querySelector(".mobile-nav__mobile-header");

  if (!announcementBar || !mobileHeader) return;

  const announcementBarHeight = announcementBar.offsetHeight || 40;
  document.documentElement.style.setProperty(
    "--announcement-bar-height",
    `${announcementBarHeight}px`
  );

  let lastScrollTop = 0;
  const scrollThreshold = 10;
  let scrollTimeout;

  const handleScroll = () => {
    // Skip if there's an active timeout to improve performance
    if (scrollTimeout) return;

    scrollTimeout = setTimeout(() => {
      const currentScrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // If we've scrolled past the threshold, hide announcement bar and move header up
      if (currentScrollTop > scrollThreshold) {
        announcementBar.classList.add("is-hidden");
        mobileHeader.classList.add("announcement-hidden");
      } else {
        // At the top of the page - show announcement bar and reset header position
        announcementBar.classList.remove("is-hidden");
        mobileHeader.classList.remove("announcement-hidden");
      }

      lastScrollTop = currentScrollTop;
      scrollTimeout = null;
    }, 10);
  };

  window.removeEventListener("scroll", handleScroll);
  window.addEventListener("scroll", handleScroll, { passive: true });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll('[data-section-type="mobile-header"]')
    .forEach(function () {
      if (typeof WAU !== "undefined" && WAU.Slideout) {
        WAU.Slideout.init("mobile-navigation");
      }
      setupDrawer();
      setupMobileSearch();
      handleMobileHeaderScroll();

      // Setup mini-cart trigger
      const miniCartTrigger = document.querySelector(
        ".mobile-nav__mobile-header .js-mini-cart-trigger"
      );
      if (miniCartTrigger && typeof WAU !== "undefined" && WAU.Slideout) {
        miniCartTrigger.addEventListener("click", function () {
          WAU.Slideout._closeByName("mobile-navigation");
        });
      }
    });
});

// Handle Shopify section events
document.addEventListener("shopify:section:select", function (event) {
  if (event.target.querySelector('[data-section-type="mobile-header"]')) {
    var container = event.target.querySelector(
      '[data-section-type="mobile-header"]'
    );

    if (
      (typeof WAU !== "undefined" && WAU.Helpers && WAU.Helpers.isTouch()) ||
      (typeof WAU !== "undefined" && WAU.Helpers && WAU.Helpers.isMobile())
    ) {
      if (typeof WAU !== "undefined" && WAU.Slideout) {
        WAU.Slideout._openByName("mobile-navigation");
      }
      setupDrawer();
    }
  }
});

document.addEventListener("shopify:section:deselect", function (event) {
  if (event.target.querySelector('[data-section-type="mobile-header"]')) {
    if (typeof WAU !== "undefined" && WAU.Slideout) {
      WAU.Slideout._closeByName("mobile-navigation");
    }
  }
});

document.addEventListener("shopify:block:select", function (event) {
  if (!event.target.querySelector('[data-section-type="mobile-header"]'))
    return false;
  if (
    (typeof WAU !== "undefined" && WAU.Helpers && WAU.Helpers.isTouch()) ||
    (typeof WAU !== "undefined" && WAU.Helpers && WAU.Helpers.isMobile())
  ) {
    if (typeof WAU !== "undefined" && WAU.Slideout) {
      WAU.Slideout._openByName("mobile-navigation");
    }
    setupDrawer();
  }
});

// Cleanup any problematic inline styles
document.addEventListener("DOMContentLoaded", function () {
  // Find slider images with inline padding styles and remove them
  const sliderImages = document.querySelectorAll(".slideshow__slide-image");
  sliderImages.forEach((slide) => {
    if (slide.style.paddingBottom) {
      slide.style.paddingBottom = "";
    }
  });

  // Fix any mobile nav dimensions
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) {
    mobileMenu.style.height = "66px";
    mobileMenu.style.contain = "layout size";
  }

  const mobileHeader = document.querySelector(".mobile-nav__mobile-header");
  if (mobileHeader) {
    mobileHeader.style.height = "66px";
    mobileHeader.style.contain = "layout";
  }
});
