const Header = {
  init: function init(container) {
    const themeHeader = document.querySelector(".js-theme-header"),
      clearElement = document.querySelector(".js-clear-element"),
      menuItemsWithNestedDropdowns = document.querySelectorAll(
        ".js-menuitem-with-nested-dropdown"
      ),
      doubleTapToGoItems = document.querySelectorAll(".js-doubletap-to-go"),
      searchSlideout = container.querySelector(".searchbox");

    // Dynamic height calculation for announcement bar and header
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
        // This is better than creating the element with JS
        const headerSpacer = document.querySelector(".header-spacer");
        if (headerSpacer) {
          headerSpacer.style.height = `${
            announcementBarHeight + headerHeight
          }px`;
        }
      };

      // Initial setup
      setHeightVariables();

      // Recalculate on window resize
      window.addEventListener("resize", setHeightVariables);

      // Recalculate after all images and resources are loaded
      window.addEventListener("load", setHeightVariables);
    }

    if (container.querySelector(".js-stickynav")) {
      setTimeout(() => {
        Header.clearSticky();
        Header.prepareSticky();
      }, 1000);
    }

    if (document.querySelectorAll(".js-search-toggle").length > 0) {
      Header.initSearch(container, searchSlideout);
    }

    if (
      menuItemsWithNestedDropdowns &&
      menuItemsWithNestedDropdowns.length > 0
    ) {
      Header.nestedDropdowns(menuItemsWithNestedDropdowns);
    }

    if (doubleTapToGoItems) {
      Header.doubleTapToGo(doubleTapToGoItems);
    }

    // Initialize scroll-aware behavior for desktop header
    Header.handleDesktopHeaderScroll();

    // Aria support
    WAU.a11yHelpers.setUpAriaExpansion();
    WAU.a11yHelpers.setUpAccessibleNavigationMenus();

    window.addEventListener("resize", () => {
      setTimeout(() => {
        Header.clearSticky();
        Header.prepareSticky();
      }, 1000);
    });

    document.addEventListener("shopify:section:select", () => {
      setTimeout(() => {
        Header.clearSticky();
        Header.prepareSticky();
      }, 1000);
    });
  },

  // Add the missing nestedDropdowns function
  nestedDropdowns: function nestedDropdowns(items) {
    if (!items || items.length === 0) return;

    items.forEach(function (item) {
      const button = item.querySelector("button, .dropdown__link");
      const menu = item.querySelector(".dropdown__menu");

      if (button && menu) {
        // Set initial states
        button.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");

        // Handle clicks on the button
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();

          const expanded = button.getAttribute("aria-expanded") === "true";

          // Close other dropdowns
          items.forEach(function (otherItem) {
            if (otherItem !== item) {
              const otherButton = otherItem.querySelector(
                "button, .dropdown__link"
              );
              const otherMenu = otherItem.querySelector(".dropdown__menu");

              if (otherButton && otherMenu) {
                otherButton.setAttribute("aria-expanded", "false");
                otherMenu.setAttribute("aria-hidden", "true");
                otherItem.classList.remove("dropdown__menuitem--active");
              }
            }
          });

          // Toggle current dropdown
          button.setAttribute("aria-expanded", (!expanded).toString());
          menu.setAttribute("aria-hidden", expanded.toString());

          if (expanded) {
            item.classList.remove("dropdown__menuitem--active");
          } else {
            item.classList.add("dropdown__menuitem--active");
          }
        });

        // Close when clicking outside
        document.addEventListener("click", function (event) {
          if (!item.contains(event.target)) {
            button.setAttribute("aria-expanded", "false");
            menu.setAttribute("aria-hidden", "true");
            item.classList.remove("dropdown__menuitem--active");
          }
        });
      }
    });
  },

  clearSticky: function clearSticky() {
    const headerEl = document.querySelector(".js-theme-header");
    const clearEls = document.querySelectorAll(".js-clear-element");

    if (!headerEl) {
      console.warn("Warning. Did not find an element to clear.");
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

  // Initialize search functionality
  initSearch: function initSearch(container, searchSlideout) {
    if (!container || !searchSlideout) return;

    const searchToggles = container.querySelectorAll(".js-search-toggle");
    searchToggles.forEach((toggle) => {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();
        WAU.Slideout._openByName("searchbox");
      });
    });
  },

  // Updated method to handle desktop header scroll behavior
  handleDesktopHeaderScroll: function handleDesktopHeaderScroll() {
    const announcementBar = document.querySelector(".announcement-bar.wrapper");
    const headerSection = document.querySelector(
      ".shopify-section-group-header-group"
    );

    if (!announcementBar || !headerSection) return;

    let scrollTimeout;
    const scrollThreshold = 10; // Amount of scroll needed to trigger hiding

    function onScroll() {
      if (scrollTimeout) return;

      scrollTimeout = setTimeout(() => {
        const currentScrollTop =
          window.pageYOffset || document.documentElement.scrollTop;

        // For desktop: We'll keep both announcement bar and header visible
        // We're adjusting only mobile behavior now
        if (window.innerWidth < 768) {
          if (currentScrollTop > scrollThreshold) {
            // Scrolling down - hide announcement bar on mobile only
            announcementBar.classList.add("is-hidden");
          } else {
            // At top or scrolling up to the top - show announcement bar
            announcementBar.classList.remove("is-hidden");
          }
        }

        scrollTimeout = null;
      }, 10);
    }

    // Add scroll listener with throttling for performance
    window.addEventListener("scroll", onScroll, { passive: true });

    // Handle resize events
    window.addEventListener(
      "resize",
      function () {
        // Need to reapply appropriate behavior based on screen size
        onScroll();
      },
      { passive: true }
    );
  },

  doubleTapToGo: function doubleTapToGo(items) {
    items.forEach(function (doubleTapItem) {
      let preventClick = false,
        prevEventTarget = undefined;

      const activeClass = doubleTapItem.getAttribute("data-active-class");

      Events.on("device:touchstart", function () {
        preventClick = true;
      });

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
};

// Initialize header for all header sections
document
  .querySelectorAll('[data-section-type="header"]')
  .forEach(function (container) {
    Header.init(container);
  });
