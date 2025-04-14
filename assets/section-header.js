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
        const announcementBarHeight = announcementBar.offsetHeight;
        const headerHeight = themeHeader.offsetHeight;

        document.documentElement.style.setProperty(
          "--announcement-bar-height",
          `${announcementBarHeight}px`
        );
        document.documentElement.style.setProperty(
          "--header-height",
          `${headerHeight}px`
        );

        // Update body padding ONLY on desktop
        if (window.innerWidth >= 768) {
          document.body.style.paddingTop = `${
            announcementBarHeight + headerHeight
          }px`;
        } else {
          // Reset padding on mobile
          document.body.style.paddingTop = "0";
        }
      };

      // Initial setup
      setHeightVariables();

      // Recalculate on window resize
      window.addEventListener("resize", setHeightVariables);
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

    if (menuItemsWithNestedDropdowns) {
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
    const announcementBarHeight = announcementBar.offsetHeight;
    document.documentElement.style.setProperty(
      "--announcement-bar-height",
      `${announcementBarHeight}px`
    );
  },

  // New method to handle desktop header scroll behavior
  handleDesktopHeaderScroll: function handleDesktopHeaderScroll() {
    // Only apply this to desktop
    if (window.innerWidth < 768) return;

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

        if (currentScrollTop > scrollThreshold) {
          // Scrolling down - hide announcement bar
          announcementBar.classList.add("is-hidden");
        } else {
          // At top or scrolling up to the top - show announcement bar
          announcementBar.classList.remove("is-hidden");
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
        if (window.innerWidth >= 768) {
          // We're on desktop, make sure handler is active
          window.removeEventListener("scroll", onScroll);
          window.addEventListener("scroll", onScroll, { passive: true });
        } else {
          // We're on mobile, remove desktop handler
          window.removeEventListener("scroll", onScroll);
          announcementBar.classList.remove("is-hidden");
        }
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
