const Header = {
  init: function init(container) {
    const themeHeader = document.querySelector(".js-theme-header"),
      clearElement = document.querySelector(".js-clear-element"),
      menuItemsWithNestedDropdowns = document.querySelectorAll(
        ".js-menuitem-with-nested-dropdown"
      ),
      doubleTapToGoItems = document.querySelectorAll(".js-doubletap-to-go"),
      searchSlideout = container.querySelector(".searchbox");

    // Dynamic height calculation for announcement bar and header - set early to prevent CLS
    const announcementBar = document.getElementById("announcement-bar");
    if (announcementBar && themeHeader) {
      const setHeightVariables = () => {
        const announcementBarHeight = announcementBar.offsetHeight || 40;
        const headerHeight = themeHeader.offsetHeight || 60;

        document.documentElement.style.setProperty(
          "--announcement-bar-height",
          `${announcementBarHeight}px`
        );
        document.documentElement.style.setProperty(
          "--header-height",
          `${headerHeight}px`
        );

        // Update header-spacer height if it exists
        const headerSpacer = document.querySelector(".header-spacer");
        if (headerSpacer) {
          headerSpacer.style.height = `${
            announcementBarHeight + headerHeight
          }px`;
        }
      };

      // Initial setup as early as possible
      setHeightVariables();

      // Recalculate on window resize (debounced)
      let resizeTimeout;
      window.addEventListener(
        "resize",
        function () {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(setHeightVariables, 100);
        },
        { passive: true }
      );

      // Recalculate after all images and resources are loaded
      window.addEventListener("load", setHeightVariables);
    }

    if (container.querySelector(".js-stickynav")) {
      Header.clearSticky();
      Header.prepareSticky();
    }

    if (document.querySelectorAll(".js-search-toggle").length > 0) {
      Header.initSearch(container, searchSlideout);
    }

    if (menuItemsWithNestedDropdowns) {
      Header.nestedDropdowns(menuItemsWithNestedDropdowns);
    }

    if (doubleTapToGoItems) {
      Header.doubleTapToGo(doubleTapToGoItems);
    }

    // Initialize scroll-aware behavior for desktop header
    Header.handleDesktopHeaderScroll();

    // Aria support
    if (typeof WAU !== "undefined" && WAU.a11yHelpers) {
      WAU.a11yHelpers.setUpAriaExpansion();
      WAU.a11yHelpers.setUpAccessibleNavigationMenus();
    }

    // Optimize resize handling
    let resizeTimer;
    window.addEventListener(
      "resize",
      function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          Header.clearSticky();
          Header.prepareSticky();
        }, 250);
      },
      { passive: true }
    );

    document.addEventListener("shopify:section:select", function () {
      setTimeout(function () {
        Header.clearSticky();
        Header.prepareSticky();
      }, 100);
    });
  },

  // Nested dropdowns function
  nestedDropdowns: function nestedDropdowns(menuItems) {
    if (!menuItems || menuItems.length === 0) return;

    menuItems.forEach(function (menuItem) {
      const submenu = menuItem.querySelector(".submenu");

      menuItem.addEventListener("mouseover", function () {
        if (submenu) {
          submenu.classList.add("is-active");
        }
        this.classList.add("is-active");
      });

      menuItem.addEventListener("mouseleave", function () {
        if (submenu) {
          submenu.classList.remove("is-active");
        }
        this.classList.remove("is-active");
      });

      // For touch devices
      menuItem.addEventListener(
        "touchstart",
        function (e) {
          if (submenu && !submenu.classList.contains("is-active")) {
            e.preventDefault();
            submenu.classList.add("is-active");
            this.classList.add("is-active");
          }
        },
        { passive: false }
      );
    });
  },

  clearSticky: function clearSticky() {
    const headerEl = document.querySelector(".js-theme-header");
    const clearEls = document.querySelectorAll(".js-clear-element");

    if (!headerEl) {
      return false;
    }

    if (headerEl.classList.contains("sticky--active")) {
      headerEl.classList.remove("sticky--active");
    }

    if (headerEl.hasAttribute("style")) {
      headerEl.removeAttribute("style");
    }
  },

  prepareSticky: function prepareSticky() {
    const announcementBar = document.getElementById("announcement-bar");
    const headerSection = document.querySelector(
      ".shopify-section-group-header-group"
    );

    if (!announcementBar || !headerSection) return;

    // Set announcement bar height
    const announcementBarHeight = announcementBar.offsetHeight || 40;
    document.documentElement.style.setProperty(
      "--announcement-bar-height",
      `${announcementBarHeight}px`
    );
  },

  // Updated method to handle desktop header scroll behavior with improved performance
  handleDesktopHeaderScroll: function handleDesktopHeaderScroll() {
    const announcementBar = document.querySelector(".announcement-bar.wrapper");
    const headerSection = document.querySelector(
      ".shopify-section-group-header-group"
    );

    if (!announcementBar || !headerSection) return;

    let scrollTimeout;
    let lastScrollTop = 0;
    const scrollThreshold = 10; // Amount of scroll needed to trigger hiding

    function onScroll() {
      // Skip if there's an active timeout
      if (scrollTimeout) return;

      scrollTimeout = setTimeout(() => {
        const currentScrollTop =
          window.pageYOffset || document.documentElement.scrollTop;

        // For desktop: We'll keep both announcement bar and header visible
        // We're adjusting only mobile behavior now
        if (window.innerWidth < 768) {
          if (
            currentScrollTop > scrollThreshold &&
            currentScrollTop > lastScrollTop
          ) {
            // Scrolling down - hide announcement bar on mobile only
            announcementBar.classList.add("is-hidden");
          } else if (
            currentScrollTop <= scrollThreshold ||
            currentScrollTop < lastScrollTop
          ) {
            // At top or scrolling up to the top - show announcement bar
            announcementBar.classList.remove("is-hidden");
          }
        }

        lastScrollTop = currentScrollTop;
        scrollTimeout = null;
      }, 10);
    }

    // Add scroll listener with throttling for performance
    window.addEventListener("scroll", onScroll, { passive: true });

    // Handle resize events efficiently
    let resizeTimer;
    window.addEventListener(
      "resize",
      function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(onScroll, 100);
      },
      { passive: true }
    );
  },

  doubleTapToGo: function doubleTapToGo(items) {
    items.forEach(function (doubleTapItem) {
      let preventClick = false,
        prevEventTarget = undefined;

      const activeClass = doubleTapItem.getAttribute("data-active-class");

      if (typeof Events !== "undefined") {
        Events.on("device:touchstart", function () {
          preventClick = true;
        });
      }

      doubleTapItem.addEventListener("click", function (event) {
        if (preventClick) {
          event.preventDefault();
        }
      });

      doubleTapItem.addEventListener(
        "touchstart",
        function (event) {
          event.target.setAttribute("aria-expanded", "false");
          Header.closeMenu(activeClass);

          if (prevEventTarget === event.target) {
            preventClick = false;
          } else {
            event.target.classList.toggle(activeClass);
            event.target.setAttribute("aria-expanded", "true");
          }

          prevEventTarget = event.target;
        },
        { passive: true }
      );
    });
  },

  closeMenu: function closeMenu(activeClass) {
    document
      .querySelectorAll(`[data-active-class="${activeClass}"]`)
      .forEach(function (activeMenu) {
        activeMenu.classList.remove(activeClass);
      });
  },

  // Init search method
  initSearch: function initSearch(container, searchSlideout) {
    if (!container || !searchSlideout) return;

    const searchToggles = container.querySelectorAll(".js-search-toggle");

    searchToggles.forEach(function (toggle) {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();

        if (typeof WAU !== "undefined" && WAU.Slideout) {
          WAU.Slideout._openByName("searchbox");

          // Focus the search input after a slight delay
          setTimeout(function () {
            const searchInput = document.querySelector(".searchbox__input");
            if (searchInput) searchInput.focus();
          }, 300);
        }
      });
    });
  },
};

// Initialize header as soon as DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    document
      .querySelectorAll('[data-section-type="header"]')
      .forEach(function (container) {
        Header.init(container);
      });
  });
} else {
  document
    .querySelectorAll('[data-section-type="header"]')
    .forEach(function (container) {
      Header.init(container);
    });
}

// Set initial CSS variables to prevent CLS
(function () {
  document.documentElement.style.setProperty(
    "--announcement-bar-height",
    "40px"
  );
  document.documentElement.style.setProperty("--header-height", "60px");

  const headerSpacer = document.querySelector(".header-spacer");
  if (headerSpacer) {
    headerSpacer.style.height = "100px"; // 40px + 60px
  }
})();
